import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a493e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff8e7',
          borderTopColor: '#ddd',
          height: 60,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 13,
        },
      }}
    >
	  <Tabs.Screen name="index" options={{ title: '打卡', /*icon等*/ }} />
      <Tabs.Screen name="星火" options={{ title: '星火', /*icon等*/ }} />
      <Tabs.Screen name="奖励" options={{ title: '奖励', /*icon等*/ }} />
      <Tabs.Screen name="个人中心" options={{ title: '个人中心', /*icon等*/ }} />
    </Tabs>
  );
}
