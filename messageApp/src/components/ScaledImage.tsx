import React, {useState, useEffect} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';

const ScaledImage = ({uri, width, height}: ScaledImageProps) => {
  const [dimensions, setDimensions] = useState<any>({
    width: null,
    height: null,
  });

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        Image.getSize(uri, (originalWidth, originalHeight) => {
          let newWidth = originalWidth;
          let newHeight = originalHeight;

          if (width && !height) {
            newWidth = width;
            newHeight = originalHeight * (width / originalWidth);
          } else if (!width && height) {
            newWidth = originalWidth * (height / originalHeight);
            newHeight = height;
          }

          if (newHeight > 250) {
            newHeight = 250;
          }
          if (newWidth > 250) {
            newWidth = 250;
          }

          setDimensions({width: newWidth, height: newHeight});
        });
      } catch (error) {
        console.error('Error fetching image size:', error);
      }
    };

    fetchImageSize();
  }, [uri, width, height]);

  return (
    <Image
      source={{uri}}
      resizeMode="contain"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxHeight: 250,
        maxWidth: 250,
        resizeMode: 'cover',
        backgroundColor: 'red',
      }}
    />
  );
};

type ScaledImageProps = {
  uri: string;
  width: number;
  height: number;
};

export default ScaledImage;
