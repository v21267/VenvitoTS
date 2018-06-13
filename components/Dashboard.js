
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  FlatList,
  ScrollView
} from 'react-native';
import {observer} from 'mobx-react/native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import moment from 'moment';

import dbHelper from '../utils/dbhelper';
import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';
import metricsDefinitions from '../utils/metricsdefinitions';
import DashboardChart from './DashboardChart';
import DashboardChart2 from './DashboardChart2';
import {CHART_HEIGHT} from './DashboardChart2';

const ios = (Platform.OS == 'ios');

const USE_FLAT_LIST = !ios;

@observer
export default class Dashboard extends Component
{
  store = observableStore; 
  periods = ['7', '30', 'M', 'Q'];
 
  constructor(props)
  {
    super(props);
    this.state = { selectedPeriodIndex: 0, data: null };
  }
 
  componentDidMount()
  {
  } 

  componentWillReceiveProps()
  {
  }

  componentWillUnmount()
  {
  }

  static getChartData()
  {
    VenvitoService.getChartData();
  }

  handlePeriodChange = (index) =>
  {
    this.setState(previousState =>
      {
        return { selectedPeriodIndex: index };
      },
      () =>
      {
        this.store.setChartPeriod(this.period());
        Dashboard.getChartData();
      });
  }

  period()
  {
    return this.periods[this.state.selectedPeriodIndex];
  }

  keyExtractor = (item, index) => item.code;

  getItemLayout = (item, index) => 
  { 
    return { length: CHART_HEIGHT, offset: CHART_HEIGHT * index, index };
  }

  renderChart = ({item}) =>
  {
    const md = item;
    const data = this.store.chartData;

 //   return <Text>{JSON.stringify(md)}</Text>

    const index = data.findIndex(d => d.code == md.code);
    if (index < 0) 
    {
      return (
        <Text key={md.code} style={styles.loading}>{md.code + ' not found'}</Text>
      );
    }

    const metricData = data[index].data;
    const totalValue = data[index].totalValue;

    return (
      <View key={md.code}>
        <DashboardChart2 
          metricsDef={md} 
          data={metricData}
          totalValue={totalValue}
        />
      </View>
    );
}

  dashboardChartList()
  {
    const data = this.store.chartData;

     if (data == null)
    {
      return (
        <View style={{flex: 1}}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      );
    }
    else if (USE_FLAT_LIST)
    {
      return (
        <FlatList
          style={{flex: 1}}
          data={metricsDefinitions}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderChart}
          getItemLayout={this.getItemLayout}
          initialNumToRender={2}
        />
      );
     }
     else
     {
       return (
        <ScrollView style={{flex: 1}}>
          {
            metricsDefinitions.map(md => {
  //        metricsDefinitions.slice(0, 1).map(md => {
              return this.renderChart({item: md});
            })          
          }
        </ScrollView>
       );
     }
  }

  onSwipe(gestureState, delta) 
  {
    if (Math.abs(gestureState.dx) < Math.abs(gestureState.dy) * 2) return;

    let newPeriodIndex = this.state.selectedPeriodIndex + delta;
    if (newPeriodIndex >= 0 && newPeriodIndex < this.periods.length)
    {
      this.handlePeriodChange(newPeriodIndex);
    }
  }

  onSwipeLeft = (gestureState) => this.onSwipe(gestureState, 1);
  onSwipeRight = (gestureState) => this.onSwipe(gestureState, -1);
 
  isVisible()
  {
    return (this.store.currentPage == 'dashboard');
  }

  render() 
  {
    if (!this.isVisible())
       return (<Text>{"Inactive (Dashboard): " + this.store.currentPage}</Text>);

    return (
      <GestureRecognizer  
        style={{flex: 1}}
        onSwipeLeft={this.onSwipeLeft}
        onSwipeRight={this.onSwipeRight}
      >      
        <View style={{flex: 1}}>
 {/*         <Text>{this.store.getChartDataDuration}</Text> */}
          {this.dashboardChartList()}
          <SegmentedControlTab
            values={['LAST\n7 DAYS', 'LAST\n30 DAYS', 'THIS\nMONTH', 'THIS\nQUARTER']}
            selectedIndex={this.state.selectedPeriodIndex}
            onTabPress={this.handlePeriodChange}
            borderRadius={0}
            tabStyle={styles.periodTabStyles}
            activeTabStyle={styles.activePeriodTabStyles}
            tabTextStyle={styles.periodTabTextStyle}
            textNumberOfLines={2}
            styles={{height: 50}}
            />
        </View>
      </GestureRecognizer>
    );
  }
}

const styles = StyleSheet.create({
  bottomRow:
  {
    height: 120,
  },

  loading:
  {
    textAlign: 'center',
    paddingTop: 100,
  },

  periodTabStyles:
  {
    borderColor: '#009CDE',
  },

  activePeriodTabStyles:
  {
    backgroundColor: '#009CDE',
  },

  periodTabTextStyle:
  {
    textAlign: 'center',
    color: '#009CDE',
    fontSize: 12,
  },
});
