// Import the QiblaFinderScreen at the top with other imports
import QiblaFinderScreen from '../screens/QiblaFinderScreen';

// Update the Drawer Navigator to include the Qibla Finder option
// Inside RootNavigator function, replace the Drawer.Navigator with this:

return (
  <Drawer.Navigator
    drawerContent={props => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerActiveBackgroundColor: colors.primary,
      drawerActiveTintColor: '#fff',
      drawerInactiveTintColor: colors.text,
      drawerLabelStyle: {
        marginLeft: -20,
        fontSize: 16,
      },
      drawerStyle: {
        backgroundColor: isDark ? colors.card : colors.background,
      },
    }}
  >
    <Drawer.Screen
      name="Main"
      component={TabNavigator}
      options={{
        title: 'Home',
        drawerIcon: ({ color }) => (
          <Ionicons name="home-outline" size={22} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="QiblaFinder"
      component={QiblaFinderScreen}
      options={{
        title: 'Qibla Finder',
        drawerIcon: ({ color }) => (
          <Ionicons name="compass-outline" size={22} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Settings',
        drawerIcon: ({ color }) => (
          <Ionicons name="settings-outline" size={22} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="About"
      component={AboutScreen}
      options={{
        title: 'About',
        drawerIcon: ({ color }) => (
          <Ionicons name="information-circle-outline" size={22} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);