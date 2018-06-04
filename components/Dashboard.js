
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

import dbHelper from '../utils/dbhelper';
import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';
import metricsDefinitions from '../utils/metricsdefinitions';
import DashboardChart from './DashboardChart';

@observer
export default class Dashboarf extends Component
{
  store = observableStore;

  periods = ['7', '30', 'M', 'Q']

  constructor(props)
  {
    super(props);
    this.state = { selectedPeriodIndex: 0 };
  }
 
  componentDidMount()
  {
  } 

  handlePeriodChange(index)
  {
    observableStore.chartPeriod = '';
    
    this.setState(previousState =>
      {
        return { selectedPeriodIndex: index };
      },
      () =>
      {
        observableStore.chartPeriod = this.periods[index];
      });
  }

  dashboardChartList()
  {
    const period = observableStore.chartPeriod;
    VenvitoService.prepareChartPeriods(period);
   
    if (period == "")
    {
      return (
        <Text style={styles.loading}>Loading...</Text>
      );
    }
    else
    {
      return (
        metricsDefinitions.map(md => {
          return (
            <DashboardChart key={md.code} metricsDef={md} dummy={observableStore.metricValueUpdateCount}/>
          );
        })
      );
    }
  }

  onSwipe(gestureState, delta) 
  {
    let newPeriodIndex = this.state.selectedPeriodIndex + delta;
    if (newPeriodIndex >= 0 && newPeriodIndex < this.periods.length)
    {
      this.handlePeriodChange(newPeriodIndex);
    }
  }
 
  render() 
  {
     return (
      <GestureRecognizer  style={{flex: 1}}
          onSwipeLeft={(state) => this.onSwipe(state, 1)}
          onSwipeRight={(state) => this.onSwipe(state, -1)}
      >      
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {this.dashboardChartList()}
          </ScrollView>
          <SegmentedControlTab
            values={['LAST\n7 DAYS', 'LAST\n30 DAYS', 'THIS\nMONTH', 'THIS\nQUARTER']}
            selectedIndex={this.state.selectedPeriodIndex}
            onTabPress={(index) => this.handlePeriodChange(index)}
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
