import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Updates from 'expo-updates';
const StorageAccessFramework = FileSystem.StorageAccessFramework;


const getDownloadDir = () => {
  if (Platform.OS === 'android') {
    // 安卓 Download 目录
    return FileSystem.StorageAccessFramework ? FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download') : FileSystem.documentDirectory;
  }
  // iOS 无 Download，用沙盒
  return FileSystem.documentDirectory;
};

export default function 个人中心() {
  // 申请存储权限（仅安卓需要）
  async function requestStoragePermission() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '存储权限',
          message: '需要访问存储以保存/导入数据文件',
          buttonNeutral: '稍后再问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  // 导出数据到 Download
  async function handleExport() {
    try {
      const [logs, spark, sparkTypes, starBalance, rewardInventory, starRecords] = await Promise.all([
        AsyncStorage.getItem('health_logs'),
        AsyncStorage.getItem('sparkRecords'),
        AsyncStorage.getItem('sparkTypes'),
        AsyncStorage.getItem('starBalance'),
        AsyncStorage.getItem('rewardInventory'),
        AsyncStorage.getItem('starRecords'),
      ]);
      const backupData = {
        health_logs: logs ? JSON.parse(logs) : [],
        sparkRecords: spark ? JSON.parse(spark) : [],
        sparkTypes: sparkTypes ? JSON.parse(sparkTypes) : [],
        starBalance: starBalance ? Number(starBalance) : 0,
        rewardInventory: rewardInventory ? JSON.parse(rewardInventory) : {},
        starRecords: starRecords ? JSON.parse(starRecords) : [],
      };
        
      // 选择目录（推荐直接让用户选Download或者你自己新建的“小狐狸打卡”文件夹）
      const dirResult = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!dirResult.granted) {
        Alert.alert('导出失败', '未获得目录权限');
        return;
      }
      // 创建json文件
      const fileUri = await StorageAccessFramework.createFileAsync(
        dirResult.directoryUri,
        'foxtrainer_backup.json',
        'application/json'
      );
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      Alert.alert('导出成功', '文件已保存到你选择的目录下');
    } catch (err) {
      Alert.alert('导出失败', err.message);
    }
  }
  

  // 从 Download 目录导入
  async function handleImport() {
    try {
      const pick = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      console.log('DocumentPicker result:', pick);
  
      // 这里换成兼容鸿蒙的获取方式
      const uri = pick.assets && pick.assets[0] && pick.assets[0].uri ? pick.assets[0].uri : pick.uri;
  
      if (uri) {
        // 文件选择成功
        Alert.alert('选中文件', uri);
        const jsonStr = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
        Alert.alert('读取内容', jsonStr.slice(0, 100)); // 只显示前100字符
        const data = JSON.parse(jsonStr);
      if (data.sparkRecords && data.sparkTypes && data.health_logs) {
        await AsyncStorage.setItem('sparkRecords', JSON.stringify(data.sparkRecords));
        await AsyncStorage.setItem('sparkTypes', JSON.stringify(data.sparkTypes));
        await AsyncStorage.setItem('health_logs', JSON.stringify(data.health_logs));
        // 新增奖励相关
        if ('starBalance' in data)
          await AsyncStorage.setItem('starBalance', String(data.starBalance));
        if ('rewardInventory' in data)
          await AsyncStorage.setItem('rewardInventory', JSON.stringify(data.rewardInventory));
        if ('starRecords' in data)
          await AsyncStorage.setItem('starRecords', JSON.stringify(data.starRecords));
        Alert.alert('导入成功', '数据已恢复', [
          { text: '好的', onPress: () => Updates.reloadAsync() }
        ]);
      } else {
          Alert.alert('导入失败', '文件格式不正确');
        }
      } else {
        Alert.alert('导入取消', '你没有选择文件');
      }
    } catch (e) {
      Alert.alert('导入失败', e.message);
    }

  }
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>个人中心</Text>
      <TouchableOpacity style={styles.btn} onPress={handleImport}>
        <Text style={styles.btnText}>导入数据</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={handleExport}>
        <Text style={styles.btnText}>导出数据</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 12, marginTop: 24, color: '#666', textAlign: 'center' }}>
        导入导出功能支持打卡、星火、类型所有数据，导入时请选择 foxtrainer_backup.json
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e7', alignItems: 'center', padding: 40 },
  text: { fontSize: 28, fontWeight: 'bold', marginBottom: 36, color: '#eb6d6d' },
  btn: { backgroundColor: '#3ca897', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 24, marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 18, textAlign: 'center' }
});
