import React from 'react';
// import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

// import { useGeolocated } from "react-geolocated";
import GeocoderField from './GeocoderField';

interface GeocoderProps {
  onSourceChange: React.Dispatch<React.SetStateAction<number[] | undefined>>
  onDestinationChange: React.Dispatch<React.SetStateAction<number[] | undefined>>
}

const Geocoder = (props: GeocoderProps) => {
  /* const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    }); */

  const [src, setSrc] = React.useState<number[]>();
  const [dest, setDest] = React.useState<number[]>();

  React.useEffect(() => {
    props.onSourceChange(src)
  }, [src, props])

  React.useEffect(() => {
    props.onDestinationChange(dest)
  }, [dest, props])
  
  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        <GeocoderField label="Source" onCoordinateChange={setSrc} />
      </Grid>
      <Grid item md={6} xs={12}>
        <GeocoderField label="Destination" onCoordinateChange={setDest} />
      </Grid>
    </Grid>
  )
}

export default Geocoder;