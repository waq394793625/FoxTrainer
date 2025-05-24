import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
⭐ 关键数据结构注释说明：
1. starBalance      // 当前小星星总余额（number）
2. rewardInventory  // 奖励库存，如 { "奶茶券": 3, "调教主导权": 1 }
3. starRecords      // 积分增减流水 [{ type: "获得"|"消耗", date, amount, reason }]
4. rewardTypes      // 奖品类型 [{ key, label, icon, points }]
*/

const defaultRewardTypes = [
  { key: '奶茶券', label: '奶茶券', icon: '🧋', points: 5 },
  { key: '调教主导权', label: '调教主导权', icon: '🦊', points: 15 },
  { key: '熬夜券', label: '熬夜券', icon: '⏰', points: 10 },
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

      {/* ...后续：兑换区、增减记录、弹窗等 */}
      <Text style={{ textAlign: 'center', color: '#bbb', marginTop: 40 }}>（这里将显示兑换区和积分流水...）</Text>
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
  paddingVertical: 8, 
  borderRadius: 12, 
  flexDirection: 'row', 
  alignItems: 'center', 
  marginRight: 10,
  minWidth: 92, // 让按钮宽度稍均匀好看
},
emoji: { fontSize: 20, marginRight: 4 },
label: { fontSize: 15, color: '#0a493e', fontWeight: '500' },
starRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
starBalance: { fontSize: 18, color: '#eba748', fontWeight: 'bold', marginRight: 8 },
addBtn: { backgroundColor: '#eb6d6d', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
addBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
