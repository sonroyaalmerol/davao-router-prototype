import * as React from 'react';
import {ViewState, Map} from 'react-map-gl';
import DeckGL from '@deck.gl/react/typed';
import {GeoJsonLayer, IconLayer} from '@deck.gl/layers/typed';

//@ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import maplibregl from "!maplibre-gl";

//@ts-ignore
import maplibreglWorker from "maplibre-gl/dist/maplibre-gl-csp-worker";

import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Geocoder from './components/Geocoder';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

//@ts-ignore
maplibregl.workerClass = maplibreglWorker;

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 512, height: 512, mask: true}
};

const App = () => {
  const [viewState, setViewState] = React.useState<Partial<ViewState> & {
    bounds?: mapboxgl.LngLatBoundsLike | undefined;
    fitBoundsOptions?: mapboxgl.FitBoundsOptions | undefined;
  }>({
    longitude: 125.504917,
    latitude: 7.041194,
    zoom: 14,
  });

  const [loading, setLoading] = React.useState(false);

  const [src, setSrc] = React.useState<number[] | undefined>();
  const [dest, setDest] = React.useState<number[] | undefined>();

  const [currentPath, setCurrentPath] = React.useState<number>(0);
  const [possibleRoutes, setPossibleRoutes] = React.useState<any[]>([]);

  const pathLayer = React.useMemo(() => {
    return new GeoJsonLayer({
      id: 'jeep-layer',
      data: possibleRoutes[currentPath] as any,
      pickable: true,
      extruded: true,
      pointType: 'circle',
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [160, 160, 180, 200],
      getLineColor: [0, 176, 255, 255],
      getPointRadius: 100,
      getLineWidth: 0.5,
      getElevation: 30
    });
  }, [possibleRoutes, currentPath]);

  const sourceLayer = React.useMemo(() => {
    return new IconLayer({
      id: 'source-layer',
      data: [
        {
          properties: {
            name: 'Source',
          },
          coordinates: src
        }
      ],
      pickable: true,
      iconAtlas: '/64113.png',
      iconMapping: ICON_MAPPING,
      getIcon: d => 'marker',
      sizeScale: 10,
      getPosition: (d: any) => d.coordinates,
      getSize: d => 5,
      getColor: d => [17, 126, 224, 255]
    });
  }, [src]);

  const destinationLayer = React.useMemo(() => {
    return new IconLayer({
      id: 'dest-layer',
      data: [
        {
          properties: {
            name: 'Destination',
          },
          coordinates: dest
        },
      ],
      pickable: true,
      iconAtlas: '/64113.png',
      iconMapping: ICON_MAPPING,
      getIcon: d => 'marker',
      sizeScale: 10,
      getPosition: d => d.coordinates,
      getSize: d => 5,
      getColor: d => [234, 67, 53, 255]
    });
  }, [dest]);

  React.useEffect(() => {
    setPossibleRoutes([]);
    if (src && !dest) {
      setViewState({
        longitude: src[0],
        latitude: src[1],
        zoom: 16,
      })
    } else if (src && dest) {
      setLoading(true);
      fetch(`${process.env.REACT_APP_BACKEND_URL}/find?src=${src[1]},${src[0]}&dest=${dest[1]},${dest[0]}`)
        .then((i) => i.json())
        .then((res: any[]) => {
          if (res?.length > 0) {
            setPossibleRoutes(res);
            setCurrentPath(0);
          }

          setLoading(false);
        }).catch((err) => {
          setLoading(false);
        });
    }
  }, [src, dest])

  const handleChange = (event: SelectChangeEvent) => {
    setCurrentPath(parseInt(event.target.value));
  };

  return (
    <div className="App">
      {loading && (
        <div className="loading-overlay">
          <Grid container style={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Grid item>
              <CircularProgress color="info" />
            </Grid>
          </Grid>
        </div>
      )}
      <DeckGL
        initialViewState={viewState}
        {...viewState}
        style={{
          width: "100%",
          height: "100vh"
        }}
        onViewStateChange={evt => setViewState(evt.viewState)}
        controller={true}
        layers={[pathLayer, sourceLayer, destinationLayer]}
        getTooltip={({object}) => object && (object.properties.name)}
      >
        <Map
          mapLib={maplibregl}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_KEY}`}
        />
      </DeckGL>
      
      <div className="search-container">
        <div className="search-div">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Geocoder onSourceChange={setSrc} onDestinationChange={setDest} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={possibleRoutes.length === 0}>
                <InputLabel id="demo-simple-select-label">Possible Routes</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Possible Routes"
                  value={currentPath.toString()}
                  onChange={handleChange}
                  disabled={possibleRoutes.length === 0}
                >
                  {possibleRoutes.map((r, i) => {
                    return (
                      <MenuItem value={i} key={`possible-route-${i}`}>{r.features.map((f: any) => f.properties.name).join(' - ')}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default App