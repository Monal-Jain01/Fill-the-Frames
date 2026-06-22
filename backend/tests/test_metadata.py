import os
import tempfile
import pytest
import h5py
import netCDF4 as nc
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.services.scientific.metadata_service import MetadataService
from app.schemas.metadata import MetadataResponse

client = TestClient(app)

@pytest.fixture
def mock_netcdf():
    fd, path = tempfile.mkstemp(suffix=".nc")
    os.close(fd)
    
    # Create a mock netcdf file
    ds = nc.Dataset(path, 'w', format='NETCDF4')
    ds.title = "Mock NetCDF"
    ds.projection = "mercator"
    
    ds.createDimension('time', None) # unlimited
    ds.createDimension('lat', 10)
    ds.createDimension('lon', 10)
    
    times = ds.createVariable('time', 'f8', ('time',))
    lats = ds.createVariable('lat', 'f4', ('lat',))
    lons = ds.createVariable('lon', 'f4', ('lon',))
    temp = ds.createVariable('temperature', 'f4', ('time', 'lat', 'lon',))
    
    lats.units = 'degrees_north'
    lons.units = 'degrees_east'
    temp.units = 'K'
    temp.grid_mapping = 'mercator'
    
    times[:] = [1620000000, 1620003600] # two time steps
    lats[:] = np.linspace(-90, 90, 10)
    lons[:] = np.linspace(-180, 180, 10)
    temp[:] = np.random.uniform(200, 300, size=(2, 10, 10))
    
    ds.close()
    
    yield path
    os.remove(path)

@pytest.fixture
def mock_hdf5():
    fd, path = tempfile.mkstemp(suffix=".h5")
    os.close(fd)
    
    with h5py.File(path, "w") as f:
        f.attrs["title"] = "Mock HDF5"
        f.attrs["projection"] = "geospatial"
        
        # Dimensions
        lat_dim = f.create_dataset("latitude", data=np.linspace(-90, 90, 10))
        lat_dim.attrs["CLASS"] = "DIMENSION_SCALE"
        
        lon_dim = f.create_dataset("longitude", data=np.linspace(-180, 180, 10))
        lon_dim.attrs["CLASS"] = "DIMENSION_SCALE"
        
        time_dim = f.create_dataset("time", data=np.array([1620000000, 1620003600]))
        time_dim.attrs["CLASS"] = "DIMENSION_SCALE"
        
        # Variable
        temp = f.create_dataset("temperature", data=np.random.uniform(200, 300, size=(2, 10, 10)))
        temp.dims[0].label = "time"
        temp.dims[1].label = "lat"
        temp.dims[2].label = "lon"
        temp.attrs["units"] = "K"
        
    yield path
    os.remove(path)

def test_extract_netcdf_metadata(mock_netcdf):
    metadata = MetadataService.extract_metadata("test_nc", mock_netcdf)
    assert metadata.format == "nc"
    assert metadata.summary.file_format == "nc"
    assert metadata.coordinates.latitude == "lat"
    assert metadata.coordinates.longitude == "lon"
    assert metadata.coordinates.projection == "mercator"
    assert metadata.temporal_info.time_steps == 2
    assert "time" in [d.name for d in metadata.dimensions]
    assert "temperature" in [v.name for v in metadata.variables]

def test_extract_hdf5_metadata(mock_hdf5):
    metadata = MetadataService.extract_metadata("test_h5", mock_hdf5)
    assert metadata.format == "h5"
    assert metadata.coordinates.latitude == "latitude"
    assert metadata.coordinates.longitude == "longitude"
    assert metadata.coordinates.projection == "geospatial"
    assert metadata.temporal_info.time_steps == 2
    assert "temperature" in [v.name for v in metadata.variables]

def test_metadata_api_not_found():
    response = client.get("/api/v1/metadata/non_existent_file")
    assert response.status_code == 404

def test_metadata_service_invalid_ext():
    with pytest.raises(ValueError):
        MetadataService.get_parser("test.txt")
