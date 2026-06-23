import { DetailedSatelliteMetadata } from '../types';

export const mockMetadata: DetailedSatelliteMetadata = {
  id: 'insat3dr-img-20230514t0800',
  name: 'INSAT-3DR Imager',
  sensor: 'Imager',
  timestamp: '2023-05-14T08:00:00Z',
  resolution: '4 km',
  crs: 'Geostationary Projection (GEO)',
  boundingBox: [44.5, -10.5, 105.5, 45.5],
  fileSize: 125829120, // ~120 MB
  dimensions: [
    { name: 'x', size: 2816 },
    { name: 'y', size: 2816 },
    { name: 'time', size: 1 },
  ],
  variables: [
    {
      name: 'TIR1',
      dtype: 'float32',
      dimensions: ['time', 'y', 'x'],
      attributes: {
        long_name: 'Thermal Infrared 1 Brightness Temperature',
        units: 'K',
        valid_range: '150.0, 350.0',
        _FillValue: NaN,
        wavelength: '10.8 µm'
      },
      min: 195.4,
      max: 312.1,
      mean: 278.5,
    },
    {
      name: 'TIR2',
      dtype: 'float32',
      dimensions: ['time', 'y', 'x'],
      attributes: {
        long_name: 'Thermal Infrared 2 Brightness Temperature',
        units: 'K',
        valid_range: '150.0, 350.0',
        _FillValue: NaN,
        wavelength: '12.0 µm'
      },
      min: 196.2,
      max: 311.5,
      mean: 277.2,
    },
    {
      name: 'MIR',
      dtype: 'float32',
      dimensions: ['time', 'y', 'x'],
      attributes: {
        long_name: 'Middle Infrared Brightness Temperature',
        units: 'K',
        valid_range: '150.0, 350.0',
        _FillValue: NaN,
        wavelength: '3.9 µm'
      },
      min: 201.0,
      max: 320.5,
      mean: 285.3,
    },
    {
      name: 'WV',
      dtype: 'float32',
      dimensions: ['time', 'y', 'x'],
      attributes: {
        long_name: 'Water Vapor Brightness Temperature',
        units: 'K',
        valid_range: '150.0, 350.0',
        _FillValue: NaN,
        wavelength: '6.5 µm'
      },
      min: 210.5,
      max: 265.8,
      mean: 242.1,
    },
    {
      name: 'VIS',
      dtype: 'uint16',
      dimensions: ['time', 'y', 'x'],
      attributes: {
        long_name: 'Visible Reflectance',
        units: '%',
        valid_range: '0, 100',
        _FillValue: 65535,
        wavelength: '0.65 µm'
      },
      min: 0.0,
      max: 98.5,
      mean: 34.2,
    }
  ],
  coordinates: [
    {
      name: 'latitude',
      dtype: 'float32',
      size: 2816,
      range: [-10.5, 45.5],
    },
    {
      name: 'longitude',
      dtype: 'float32',
      size: 2816,
      range: [44.5, 105.5],
    },
    {
      name: 'time',
      dtype: 'int64',
      size: 1,
      range: [1684051200, 1684051200], // epoch seconds
    }
  ]
};
