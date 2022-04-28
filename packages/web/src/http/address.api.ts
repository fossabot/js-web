import { centralHttp as http } from './index';
import API_PATHS from '../constants/apiPaths';

const AddressApi = {
  getSubdistricts: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.GET_SUBDISTRICT, {
      params: queryOptions,
    });
    return response.data.data;
  },
  getDistricts: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.GET_DISTRICT, {
      params: queryOptions,
    });
    return response.data.data;
  },
  getProvince: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.GET_PROVINCE, {
      params: queryOptions,
    });
    return response.data.data;
  },
  getZipCode: async (queryOptions = {}): Promise<any> => {
    const response = await http.get(API_PATHS.GET_ZIPCODE, {
      params: queryOptions,
    });
    return response.data.data;
  },
};

export default AddressApi;
