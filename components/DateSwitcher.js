import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import {observer} from 'mobx-react/native';

import VenvitoService from '../utils/venvitoservice';

const ios = (Platform.OS == 'ios');


@observer
export default class DateSwitcher extends Component 
{
  get currentDateCaption()
  {
    return (this.isToday     ? "Today" :
            this.isYesterday ? "Yesterday" :
                               moment(this.currentDate).format('dddd, MMM D YYYY'));
  }

  shiftDate(delta)
  {
    VenvitoService.shiftDate(delta);
  }

  get currentDate()
  {
    return new Date(this.props.store.currentDate);
  }

  get isToday()
  {
    return (this.currentDate.toDateString() == new Date().toDateString());
  }

  get isYesterday()
  {
    return (this.currentDate.toDateString() ==
            VenvitoService.addDays(new Date(), -1).toDateString());
  }

  get today()
  {
    return new Date();
  }
   
  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={() => this.shiftDate(-1)} style={styles.button}>
          <Icon name='caret-left' size={32} color="#009CDE"></Icon>
        </TouchableHighlight>
        <Text style={styles.dateCaption}>{this.currentDateCaption}</Text>
        <TouchableHighlight onPress={() => this.shiftDate(1)} disabled={this.isToday} style={styles.button}>
          <Icon name='caret-right' size={32} color={this.isToday ? "#88CCFE" : "#009CDE"}></Icon>
        </TouchableHighlight>
      </View>
    
     );
  }
}

const styles = StyleSheet.create({
  container:
  {
    flexDirection: 'row', 
    justifyContent: 
    'space-between', 
    padding: 10,
    backgroundColor: '#EEEEEE',
  },

  dateCaption:
  {
    fontSize: 18,
//    fontWeight: 'bold',
    color: '#000000',
    marginTop: (ios ? 5 : 2),
  },
  
  button: 
  {
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },

});
