import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  NativeModules,
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';

import observableStore from '../utils/store';
import Activities from './Activities';
import Dashboard from './Dashboard';
import VenvitoService from '../utils/venvitoservice';

const ios = (Platform.OS == 'ios');

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width,
};

const ActivityRoute = () => <Activities />;
const DashboardRoute = () => <Dashboard />;

export default class AppRoot extends Component {
  state = {
    index: observableStore.currentPageIndex,
    routes: [
      { key: 'activity', title: 'Activity' },
      { key: 'dashboard', title: 'Dashboard' },
    ],
  };
  
  _handleIndexChange = index => {
    this.setState({index: index});
    observableStore.setCurrentPage(index, this.state.routes[index].key);
    if (observableStore.currentPage == 'dashboard')
    {
      Dashboard.getChartData();
    }
  };
  
  _renderHeader = props => (
    <View style={styles.header}>
      <Image
        source={require('../img/Header.png')}
      />
    </View>
  );

  _renderFooter = props => (
    <TabBar {...props}  
            renderIcon={this._renderIcon} 
            getLabelText={this._getLabelText}
            tabStyle={styles.tabBar} labelStyle={styles.tabLabel}/>
  );

  _renderIcon = scene => (
   <Icon name={scene.route.key == 'activity' ? 'tty' : 'bar-chart'} 
          size={24} color="#009CDE"
    />
  );

  _getLabelText = scene => {
    return scene.route.title;
  };
  
  _renderScene = SceneMap({
    activity: ActivityRoute,
    dashboard: DashboardRoute,
  });
    
  render() {
    return (
      <TabViewAnimated
        navigationState={this.state}
        renderScene={this._renderScene}
        renderHeader={this._renderHeader}
        renderFooter={this._renderFooter}
        onIndexChange={this._handleIndexChange}
        initialLayout={initialLayout}
        animationEnabled={false}
        swipeEnabled={false}
      />   
 );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: 
  {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#009CDE',
    padding: 10,
    paddingTop: (ios ? 25 : 10),
 },

 tabBar:
 {
    backgroundColor: '#F9F9F9',
  },

  tabLabel:
  {
    color: '#009CDE',
    fontSize: 14,
  },
});
