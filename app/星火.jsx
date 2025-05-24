import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const defaultTypes = ['主目标', '微探索', '充能', '灵感'];

export default function 星火() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState(defaultTypes[0]);
  const [newContent, setNewContent] = useState('');
  const [customTypes, setCustomTypes] = useState([]);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 1. 加载本地数据
  useEffect(() => {
    AsyncStorage.getItem('sparkRecords').then(data => {
      if (data) setRecords(JSON.parse(data));
    });
    AsyncStorage.getItem('sparkTypes').then(data => {
      if (data) setCustomTypes(JSON.parse(data));
    });
  }, []);

  // 2. 每次 records 变化自动保存
  useEffect(() => {
    AsyncStorage.setItem('sparkRecords', JSON.stringify(records));
  }, [records]);

  // 3. 每次自定义类型变化自动保存
  useEffect(() => {
    AsyncStorage.setItem('sparkTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  // 所有类型（默认+自定义）
  const allTypes = [...defaultTypes, ...customTypes];

  // 按日期降序排列
  const groupedRecords = {};
  records.forEach((rec) => {
    if (!groupedRecords[rec.date]) groupedRecords[rec.date] = [];
    groupedRecords[rec.date].push(rec);
  });
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  function handleAddOrEdit() {
    if (!newDate || !newContent) return;
    const entry = { date: newDate, type: newType, content: newContent, done: false };
    if (editingIndex !== null) {
      // 编辑
      const newRecords = [...records];
      newRecords[editingIndex] = { ...newRecords[editingIndex], ...entry };
      setRecords(newRecords);
    } else {
      setRecords([{ ...entry }, ...records]);
    }
    setShowModal(false);
    setEditingIndex(null);
    setNewDate('');
    setNewType(defaultTypes[0]);
    setNewContent('');
  }

  function handleEdit(date, idx) {
    const i = records.findIndex((r, i) => r.date === date && groupedRecords[date].indexOf(r) === idx);
    if (i !== -1) {
      setEditingIndex(i);
      setNewDate(records[i].date);
      setNewType(records[i].type);
      setNewContent(records[i].content);
      setShowModal(true);
    }
  }

  function handleDelete(date, idx) {
    const i = records.findIndex((r, i) => r.date === date && groupedRecords[date].indexOf(r) === idx);
    if (i !== -1) {
      const newRecords = [...records];
      newRecords.splice(i, 1);
      setRecords(newRecords);
    }
  }

  function handleToggleDone(date, idx) {
    const i = records.findIndex((r, i) => r.date === date && groupedRecords[date].indexOf(r) === idx);
    if (i !== -1) {
      const newRecords = [...records];
      newRecords[i].done = !newRecords[i].done;
      setRecords(newRecords);
    }
  }

  function handleAddCustomType() {
    if (newTypeInput && !allTypes.includes(newTypeInput)) {
      setCustomTypes([...customTypes, newTypeInput]);
      setNewType(newTypeInput);
      setShowTypeInput(false);
      setNewTypeInput('');
    }
  }

  function formatDateWithWeek(date) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const d = new Date(date);
    const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `${ymd} (周${days[d.getDay()]})`;
  }

  function showDateHelper(date) {
    const now = new Date();
    const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    if (ymd(date) === ymd(now)) {
      return `${ymd(date)}（今天）`;
    }
    return `${ymd(date)}（周${week}）`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>星火 · 计划</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { setShowModal(true); setEditingIndex(null); }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ 新增记录</Text>
      </TouchableOpacity>
      <FlatList
        data={sortedDates}
        keyExtractor={item => item}
        renderItem={({ item: date }) => (
          <View style={styles.section}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{date}</Text>
              <TouchableOpacity onPress={() => { setNewDate(date); setShowModal(true); setEditingIndex(null); }}>
                <Text style={styles.addSubBtn}>＋</Text>
              </TouchableOpacity>
            </View>
            {groupedRecords[date].map((rec, idx) => (
              <View key={idx} style={styles.recordRow}>
                <TouchableOpacity onPress={() => handleToggleDone(date, idx)}>
                  <Text style={[styles.checkbox, rec.done && styles.checked]}>{rec.done ? '√' : ' '}</Text>
                </TouchableOpacity>
                <Text style={styles.type}>{rec.type}</Text>
                <Text style={styles.content}>{rec.content}</Text>
                <TouchableOpacity onPress={() => handleEdit(date, idx)}>
                  <Text style={styles.editBtn}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(date, idx)}>
                  <Text style={styles.deleteBtn}>删除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalMask}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingIndex !== null ? '编辑记录' : '新增记录'}</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 8,
              backgroundColor: '#fff',
              paddingHorizontal: 8,
              marginBottom: 12,
              height: 44
            }}>
              <TouchableOpacity
                style={{ flex: 1, justifyContent: 'center' }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: newDate ? '#333' : '#aaa', fontSize: 16 }}>
                  {newDate ? formatDateWithWeek(newDate) : "选择日期"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginLeft: 10,
                  backgroundColor: '#e8eee3',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                onPress={() => {
                  const today = new Date();
                  setDateObj(today);
                  setNewDate(formatDateWithWeek(today).slice(0, 10));
                }}
              >
                <Text style={{ color: '#2f81a4', fontSize: 14 }}>回到今天</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDateObj(selectedDate);
                    setNewDate(formatDateWithWeek(selectedDate).slice(0, 10));
                  }
                  setShowDatePicker(false);
                }}
                minimumDate={new Date(2023, 0, 1)}
                maximumDate={new Date(2099, 11, 31)}
              />
            )}
            <View style={styles.typeRow}>
              <Text style={{ fontWeight: 'bold' }}>类型：</Text>
              <TouchableOpacity
                style={styles.typeSelector}
                onPress={() => setShowTypeInput(true)}>
                <Text>{newType}</Text>
              </TouchableOpacity>
              {showTypeInput && (
                <TouchableOpacity
                  style={styles.fullScreenMask}
                  activeOpacity={1}
                  onPress={() => setShowTypeInput(false)}
                >
                  <View style={styles.typeModal}>
                    {allTypes.map(type => (
                      <TouchableOpacity key={type} onPress={() => { setNewType(type); setShowTypeInput(false); }}>
                        <Text style={styles.typeOption}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                    <TextInput
                      style={styles.typeInput}
                      placeholder="自定义类型"
                      value={newTypeInput}
                      onChangeText={setNewTypeInput}
                    />
                    <TouchableOpacity onPress={handleAddCustomType}>
                      <Text style={styles.typeAddBtn}>添加</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, {minHeight: 60, maxHeight: 120, textAlignVertical: 'top'}]}
              placeholder="内容"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrEdit}>
                <Text style={{ color: '#fff' }}>完成</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={{ color: '#aaa' }}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff8e7' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#eb6d6d', marginBottom: 16, textAlign: 'center' },
  addBtn: { backgroundColor: '#3ca897', padding: 10, borderRadius: 24, alignSelf: 'center', marginBottom: 10 },
  section: { marginBottom: 16, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateText: { fontWeight: 'bold', color: '#2f81a4', fontSize: 18, marginRight: 8 },
  addSubBtn: { color: '#eb6d6d', fontSize: 22, marginLeft: 'auto' },
  recordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, backgroundColor: '#e8eee3', borderRadius: 8, padding: 6 },
  checkbox: { borderWidth: 1, borderColor: '#3ca897', borderRadius: 6, width: 24, height: 24, textAlign: 'center', marginRight: 10 },
  checked: { color: '#3ca897', fontWeight: 'bold', fontSize: 20 },
  type: { backgroundColor: '#f7d08a', borderRadius: 8, paddingHorizontal: 6, marginRight: 6, fontSize: 14 },
  content: { flex: 1, fontSize: 16, color: '#0a493e', marginRight: 4 },
  editBtn: { color: '#3ca897', marginHorizontal: 6 },
  deleteBtn: { color: '#eb6d6d', marginHorizontal: 6 },
  modalMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 18, width: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#eb6d6d' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12, fontSize: 16, backgroundColor: '#fff' },
  typeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeSelector: { borderWidth: 1, borderColor: '#3ca897', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 4 },
  typeModal: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3ca897', borderRadius: 8, position: 'absolute', top: 34, left: 80, zIndex: 100, padding: 8, width: 150 },
  typeOption: { padding: 6, fontSize: 16 },
  typeInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 6, padding: 4, marginTop: 4, marginBottom: 4 },
  typeAddBtn: { color: '#eb6d6d', fontSize: 16, textAlign: 'right', marginTop: 2 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#3ca897', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 6 },
  fullScreenMask: {position: 'absolute',top: 0, left: 0, right: 0, bottom: 0,zIndex: 99,justifyContent: 'center',alignItems: 'center',
  },
});
