import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

interface Place {
  id: number;
  coordinates: number[];
  city: string;
  locality: string;
  street: string;
  district: string;
  name: string;
}

interface GeocoderFieldProps {
  label: string;
  onCoordinateChange: React.Dispatch<React.SetStateAction<number[] | undefined>>
}

export default function GeocoderField(props: GeocoderFieldProps) {
  const [value, setValue] = React.useState<Place | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<readonly Place[]>([]);

  React.useEffect(() => {
    props.onCoordinateChange(value?.coordinates)
  }, [value, props])

  const debFetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: readonly Place[]) => void,
        ) => {
          fetch(`https://photon.komoot.io/api/?q=${request.input}&lat=7.207573&lon=125.395874&limit=2`).then(res => res.json()).then(collection => {
            callback(collection.features.map((feature: any) => ({
              id: feature.properties.osm_id,
              coordinates: feature.geometry.coordinates,
              city: feature.properties.city,
              locality: feature.properties.locality,
              street: feature.properties.street,
              district: feature.properties.district,
              name: feature.properties.name
            })) as Place[])
          })
        },
        200,
      ),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    debFetch({ input: inputValue }, (results?: readonly Place[]) => {
      if (active) {
        let newOptions: readonly Place[] = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, debFetch]);

  return (
    <Autocomplete
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: Place | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={props.label} fullWidth />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            <Grid container alignItems="center">
              <Grid item>
                <Box
                  component={LocationOnIcon}
                  sx={{ color: 'text.secondary', mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                <Typography variant="body2" color="text.secondary">
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.street}, {option.city}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
}
