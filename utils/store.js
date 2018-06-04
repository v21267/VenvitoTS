import {observable} from 'mobx';
import VenvitoService from './venvitoservice';

class ObservableStore 
{
  @observable currentDate = VenvitoService.initialDate;
  @observable data = null;
  @observable maxCountWidth = 0;
  @observable chartPeriod = '7';
  @observable metricValueUpdateCount = 0;
}

const observableStore = new ObservableStore();
export default observableStore;