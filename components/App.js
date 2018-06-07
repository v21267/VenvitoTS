/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component, PureComponent } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import AppRoot from './AppRoot';


export default class App extends PureComponent {
  render() {
    return (
      <AppRoot></AppRoot>
    );
  }
}

const styles = StyleSheet.create({
  
});
