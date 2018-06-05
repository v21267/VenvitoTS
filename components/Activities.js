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
import Icon from 'react-native-vector-icons/FontAwesome';
import {observer} from 'mobx-react/native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import dbHelper from '../utils/dbhelper';
import VenvitoService from '../utils/venvitoservice';
import observableStore from '../utils/store';
import DateSwitcher from './DateSwitcher';
import ActivityRow from './ActivityRow';

@observer
export default class Activities extends Component
{
  store = observableStore;
 
  componentDidMount()
  {
    VenvitoService.getMetricsData(this.store.currentDate);
  } 

  activityList()
  {
    const data = this.store.data;
    if (data == null) return (<Text style={styles.loading}>Loading...</Text>);

    const arr = new Array();
    for (let i = 0; i < data.length; i++)
    {
      const row = data[i];
      arr.push((<ActivityRow data={row} key={row.code}/>));
    }
    arr.push(<View style={styles.bottomRow} key={'bottomRow'}/>);
    return arr;
  }

  renderActivity(row)
  {
    return (
      <ActivityRow data={row} key={row.code}/>
    );
  }

  onSwipe(gestureState, delta) 
  {
    VenvitoService.shiftDate(delta);
  }
 
  isVisible()
  {
    return (this.store.currentPage == 'activity');
  }

  render() 
  {
    if (!this.isVisible())
    return (<Text>Inactive</Text>);

    return (
      <GestureRecognizer
        onSwipeLeft={(state) => this.onSwipe(state, 1)}
        onSwipeRight={(state) => this.onSwipe(state, -1)}
      >
        <View styles={styles.container}>
          <DateSwitcher store={this.store}/>
          <ScrollView styles={styles.container}>
            {this.activityList()}
          </ScrollView>
        </View>   
      </GestureRecognizer>
    );
  }
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
  },

  bottomRow:
  {
    height: 120,
  },

  loading:
  {
    textAlign: 'center',
    paddingTop: 100,
  },
});
