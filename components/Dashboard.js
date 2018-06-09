
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
        this.store.chartPeriod = this.period();
        Dashboard.getChartData();
      });
  }

  period()
  {
    return this.periods[this.state.selectedPeriodIndex];
  }

  dashboardChartList()
  {
    const data = this.store.chartData;

     if (data == null)
    {
      return (
        <Text style={styles.loading}>Loading...</Text>
      );
    }
    else
    {
      return (
        metricsDefinitions.map(md => {
//        metricsDefinitions.slice(0, 1).map(md => {
          const index = data.findIndex(d => d.code == md.code);
          if (index < 0) 
          {
            return (
              <Text style={styles.loading}>{md.code + ' not found'}</Text>
            );
          }

          const metricData = data[index].data;
          const totalValue = data[index].totalValue;

          return (
            <DashboardChart2 key={md.code} 
                            metricsDef={md} 
                            data={metricData}
                            totalValue={totalValue}
            />
          );
        })
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
          <ScrollView style={{flex: 1}}>
            {this.dashboardChartList()}
          </ScrollView>
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
