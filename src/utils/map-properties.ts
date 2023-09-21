import lodash from 'lodash';

interface IConfiguration {
  [key: string]: string;
}

function mapProperties(configuration: IConfiguration) {
  return (data: Record<string, any> | null) => {
    if (data) {
      return Object.entries(data).reduce(
        (accumulator: Record<string, any>, [key, value]: [string, any]) => {
          return lodash.set(accumulator, configuration[key] || key, value);
        },
        {}
      );
    }
    return data;
  };
}

export default mapProperties;
