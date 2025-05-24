import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import { Image } from 'react-native'

/*
⭐ 关键数据结构注释说明：
1. starBalance      // 当前小星星总余额（number）
2. rewardInventory  // 奖励库存，如 { "奶茶券": 3, "调教主导权": 1 }
3. starRecords      // 积分增减流水 [{ type: "获得"|"消耗", date, amount, reason }]
4. rewardTypes      // 奖品类型 [{ key, label, icon, points }]
*/

const defaultRewardTypes = [
  { key: '奶茶券', label: '奶茶券', points: 5, img: require('../assets/images/naicha.png') },
  { key: '调教主导权', label: '调教主导权', points: 15, img: require('../assets/images/tiaojiao.png') },
  { key: '熬夜券', label: '熬夜券', points: 10, img: require('../assets/images/aoye.png') },
];

export default function 奖励() {
  // 当前星星余额
  const [starBalance, setStarBalance] = useState(0);
  // 奖励库存
  const [rewardInventory, setRewardInventory] = useState({});
  // 星星增减流水
  const [starRecords, setStarRecords] = useState([]);
  // 奖品类型（后续可扩展自定义）
  const [rewardTypes, setRewardTypes] = useState(defaultRewardTypes);

  // 弹窗状态
  const [showAddStar, setShowAddStar] = useState(false);
  const [addStarAmount, setAddStarAmount] = useState('');
  const [addStarReason, setAddStarReason] = useState('');
  const [addStarDate, setAddStarDate] = useState('');
  const [addStarTime, setAddStarTime] = useState('');

  // 本地存储加载（页面初始化时只执行一次）
  useEffect(() => {
    (async () => {
      // 1. 加载星星余额
      const savedStar = await AsyncStorage.getItem('starBalance');
      if (savedStar) setStarBalance(Number(savedStar));
      // 2. 加载奖励库存
      const savedInventory = await AsyncStorage.getItem('rewardInventory');
      if (savedInventory) setRewardInventory(JSON.parse(savedInventory));
      // 3. 加载星星流水
      const savedRecords = await AsyncStorage.getItem('starRecords');
      if (savedRecords) setStarRecords(JSON.parse(savedRecords));
      // 4. 奖品类型暂时用默认
    })();
  }, []);


  // 同步星星余额到本地
  const syncStarBalance = async (balance) => {
    setStarBalance(balance);
    await AsyncStorage.setItem('starBalance', String(balance));
  };

  // 同步奖励库存到本地
  const syncRewardInventory = async (inventory) => {
    setRewardInventory(inventory);
    await AsyncStorage.setItem('rewardInventory', JSON.stringify(inventory));
  };

  // 同步流水到本地
  const syncStarRecords = async (records) => {
    setStarRecords(records);
    await AsyncStorage.setItem('starRecords', JSON.stringify(records));
  };

  // ...后续添加：加星星、兑换奖励、消耗奖励、显示弹窗、记录翻页

  return (
    <View style={styles.container}>
      {/* 奖励库存显示 */}
      <View style={styles.rewardArea}>
        {/* 第一行：奶茶券、熬夜券、星星余额 */}
        <View style={styles.rewardRow}>
          <TouchableOpacity style={styles.rewardBtn}>
            <Text style={styles.emoji}>🧋</Text>
            <Text style={styles.label}>奶茶券 x{rewardInventory['奶茶券'] || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rewardBtn}>
            <Text style={styles.emoji}>⏰</Text>
            <Text style={styles.label}>熬夜券 x{rewardInventory['熬夜券'] || 0}</Text>
          </TouchableOpacity>
          {/* 右侧：星星余额+按钮 */}
          <View style={styles.starRow}>
            <Text style={styles.starBalance}>⭐{starBalance}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddStar(true)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 第二行：调教主导权 */}
        <View style={styles.rewardRow}>
          <TouchableOpacity style={styles.rewardBtn}>
            <Text style={styles.emoji}>🦊</Text>
            <Text style={styles.label}>调教主导权 x{rewardInventory['调教主导权'] || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 兑换区 */}
      <View style={styles.exchangeArea}>
        <Text style={styles.exchangeTitle}>兑换区</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {rewardTypes.map(rt => (
            <TouchableOpacity
              key={rt.key}
              style={styles.exchangeBtn}
              onPress={() => {
                if (starBalance < rt.points) {
                  Alert.alert('兑换失败', '当前小星星余额不足哦~');
                  return;
                }
                Alert.alert(
                  '兑换确认',
                  `确认消耗${rt.points}颗小星星兑换【${rt.label}】？`,
                  [
                    { text: '取消' },
                    {
                      text: '确认',
                      onPress: async () => {
                        // 1. 扣积分
                        const newBalance = starBalance - rt.points;
                        await syncStarBalance(newBalance);
                        // 2. 奖励+1
                        const newInventory = { ...rewardInventory };
                        newInventory[rt.key] = (newInventory[rt.key] || 0) + 1;
                        await syncRewardInventory(newInventory);
                        // 3. 增加流水
                        const newRecord = {
                          type: '消耗',
                          date: new Date().toISOString(),
                          amount: rt.points,
                          reason: `兑换${rt.label}`
                        };
                        const allRecords = [{ ...newRecord }, ...starRecords];
                        await syncStarRecords(allRecords);
                        Alert.alert('兑换成功', `获得了【${rt.label}】！`);
                      }
                    }
                  ]
                );
              }}
            >
            <Image source={rt.img} style={{ width: 40, height: 40, marginBottom: 4 }} />
            <Text style={styles.label}>{rt.label}</Text>
            <Text style={{ color: '#eba748', fontWeight: 'bold', marginTop: 2 }}>({rt.points})</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 积分流水 */}
      <View style={styles.recordArea}>
        <Text style={styles.recordTitle}>小星星增减记录</Text>
        <FlatList
          data={starRecords.slice(0, 10)}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.recordRow}>
              <Text style={styles.recordType}>{item.type === '获得' ? '➕' : '➖'}</Text>
              <Text style={styles.recordText}>
                {new Date(item.date).toLocaleString('zh-CN', { hour12: false }).replace('T', ' ').slice(0, 16)}
                {'  '}
                {item.reason}  {item.amount}颗
              </Text>
            </View>
          )}
        />
      </View>

      {/* 加星星弹窗 */}
      <Modal visible={showAddStar} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.13)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
            width: 290
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#2f81a4', marginBottom: 10 }}>增加小星星</Text>
            <TextInput
              style={{
                borderWidth: 1, borderColor: '#eee', borderRadius: 8,
                padding: 8, marginBottom: 10, fontSize: 16
              }}
              placeholder="数量"
              keyboardType="numeric"
              value={addStarAmount}
              onChangeText={setAddStarAmount}
            />
            <TextInput
              style={{
                borderWidth: 1, borderColor: '#eee', borderRadius: 8,
                padding: 8, marginBottom: 10, fontSize: 16
              }}
              placeholder="原因（如打卡、奖励等）"
              value={addStarReason}
              onChangeText={setAddStarReason}
            />
            {/* 可选：日期时间 */}
            {/* <TextInput ... /> */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#3ca897',
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 6,
                  marginRight: 10
                }}
                onPress={async () => {
                  const num = Number(addStarAmount);
                  if (isNaN(num) || num <= 0) {
                    Alert.alert('请输入有效数量');
                    return;
                  }
                  // 1. 增加余额
                  await syncStarBalance(starBalance + num);
                  // 2. 增加流水
                  const newRecord = {
                    type: '获得',
                    date: new Date().toISOString(),
                    amount: num,
                    reason: addStarReason || '手动添加'
                  };
                  const allRecords = [{ ...newRecord }, ...starRecords];
                  await syncStarRecords(allRecords);
                  setShowAddStar(false);
                  setAddStarAmount('');
                  setAddStarReason('');
                }}>
                <Text style={{ color: '#fff' }}>确认</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6
                }}
                onPress={() => {
                  setShowAddStar(false);
                  setAddStarAmount('');
                  setAddStarReason('');
                }}>
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
  container: { flex: 1, backgroundColor: '#fff8e7', padding: 16 },
rewardArea: { marginBottom: 12 },
rewardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
rewardBtn: { 
  backgroundColor: '#e8eee3', 
  paddingHorizontal: 12, 
  paddingVertical: 6, 
  borderRadius: 12, 
  flexDirection: 'row', 
  alignItems: 'center', 
  marginRight: 10,
  minWidth: 92, // 让按钮宽度稍均匀好看
},
emoji: { fontSize: 24, marginBottom: 8 },
label: { fontSize: 16, color: '#0a493e', fontWeight: '500' },
starRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
starBalance: { fontSize: 18, color: '#eba748', fontWeight: 'bold', marginRight: 8 },
addBtn: { backgroundColor: '#eb6d6d', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

exchangeArea: { marginBottom: 14 },
exchangeTitle: { fontSize: 17, color: '#2f81a4', fontWeight: 'bold', marginBottom: 6 },
exchangeBtn: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#e8eee3',
  borderRadius: 16,
  width: 96, // 固定宽高成正方形
  height: 96,
  margin: 6,
  alignItems: 'center',
  justifyContent: 'center',
  // 可以加阴影等效果
},

recordArea: { marginTop: 20 },
recordTitle: { fontSize: 16, color: '#2f81a4', fontWeight: 'bold', marginBottom: 6 },
recordRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
recordType: { fontWeight: 'bold', fontSize: 17, width: 26, textAlign: 'center', color: '#eba748' },
recordText: { fontSize: 14, color: '#0a493e' },
});
