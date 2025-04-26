import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Button,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 根据打卡类型返回对应颜色
const getTypeColor = (type) => {
  switch (type) {
    case '早餐':
    case '午餐':
    case '晚餐':
      return '#0a584a';
    case '起床':
      return '#eba748';
    case '睡觉':
      return '#2f81a4';
    case '吃药':
      return '#366e3b';
    default:
      return '#ccc';
  }
};

export default function HealthTracker() {
  const [logs, setLogs] = useState([]);

  // 记录打卡
  const handleLog = async (type) => {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logEntry = `${dateString} ${type} ${timeString}`;
    const newLogs = [logEntry, ...logs];
    setLogs(newLogs);
    await AsyncStorage.setItem('health_logs', JSON.stringify(newLogs));
  };

  // 删除打卡
  const deleteLog = async (date, idxToDelete) => {
    // 按日期和原始日志索引删除对应记录
    const updated = logs.filter((entry, i) => {
      const [entryDate] = entry.split(/\s+/);
      return !(entryDate === date && i === idxToDelete);
    });
    setLogs(updated);
    await AsyncStorage.setItem('health_logs', JSON.stringify(updated));
  };

  // 加载本地存储
  const loadLogs = async () => {
    const stored = await AsyncStorage.getItem('health_logs');
    if (stored) setLogs(JSON.parse(stored));
  };

  React.useEffect(() => {
    loadLogs();
  }, []);

  // 分组数据为 SectionList 所需格式
  const sections = useMemo(() => {
    const map = {};
    logs.forEach((entry, idx) => {
      const [date, type, time] = entry.split(/\s+/);
      if (!map[date]) map[date] = [];
      map[date].push({ time, type, raw: entry, index: idx });
    });
    const dates = [...new Set(logs.map((e) => e.split(/\s+/)[0]))];
    return dates.map((date) => ({ title: date, data: map[date] }));
  }, [logs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>安琪专属健康打卡</Text>
      <View style={styles.buttonContainer}>
        {['起床', '早餐', '午餐', '晚餐', '吃药', '睡觉'].map((type) => (
          <View key={type} style={styles.buttonWrapper}>
            <Button
              title={type}
              onPress={() => handleLog(type)}
              color={getTypeColor(type)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>今日打卡记录：</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.raw + item.index}
        renderSectionHeader={({ section }) => (
          <Text style={styles.dateHeader}>{section.title}</Text>
        )}
        renderItem={({ item, section }) => {
          const bgColor = getTypeColor(item.type);
          return (
            <View style={[styles.recordItem, { backgroundColor: bgColor }]}>              
              <Text style={styles.recordText}>{`${item.time} ${item.type}`}</Text>
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => deleteLog(section.title, item.index)}
              >
                <Text style={styles.deleteText}>删除</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8E7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonWrapper: {
    width: '30%',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a493e',
    marginBottom: 10,
  },
  dateHeader: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 18,
    fontWeight: '600',
    color: '#0a493e',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  recordText: {
    fontSize: 18,
    color: '#e8eee3',
  },
  deleteIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: 'red',
    fontSize: 14,
  },
});
