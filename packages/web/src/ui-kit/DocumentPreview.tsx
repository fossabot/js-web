import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { Orientation, Style } from '@react-pdf/types';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const { theme } = resolveConfig(tailwindConfig);

// all content must have z-index to properly align it in the pdf
// else, the "background image" will cover all of the text somehow
const defaultStyles = StyleSheet.create({
  imageView: {
    position: 'relative',
    zIndex: 0,
  },
  image: {
    top: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
  },
  nameViewVertical: {
    zIndex: 0,
    position: 'absolute',
    top: '51.5%',
    left: '50%',
  },
  nameViewHorizontal: {
    zIndex: 0,
    position: 'absolute',
    top: '17.5%',
    left: '50%',
  },
  name: {
    position: 'relative',
    left: '-50%',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: '"Noto Sans"',
  },
  titleViewVertical: {
    zIndex: 0,
    position: 'absolute',
    bottom: '31.5%',
    left: '50%',
  },
  titleViewHorizontal: {
    zIndex: 0,
    position: 'absolute',
    top: '37.5%',
    left: '50%',
  },
  title: {
    position: 'relative',
    left: '-50%',
    color: theme.colors.brand.primary,
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: '"Noto Sans"',
  },
  dateViewVertical: {
    zIndex: 0,
    position: 'absolute',
    bottom: '45px',
    left: '45%',
  },
  dateViewHorizontal: {
    zIndex: 0,
    position: 'absolute',
    bottom: '45px',
    left: '45%',
  },
  date: {
    fontSize: '16px',
  },
});

type DefaultStyleKeys = keyof typeof defaultStyles;

// this is saved state across components, we use this as reference to `hasRegisteredFont`
// so that we don't have to register the font(s) twice
let globalHasRegisteredFont = false;

interface IDocumentPreviewProps {
  templateUrl: string;
  name: string;
  title: string;
  date: Date;
  orientation: Orientation;
  styles?: { [key in DefaultStyleKeys]?: Style };
}

export const DocumentPreview = ({
  templateUrl,
  name,
  title,
  date,
  orientation,
  styles,
}: IDocumentPreviewProps) => {
  const [hasRegisteredFont, setHasRegisteredFont] = useState(
    globalHasRegisteredFont,
  );

  const formattedDate = format(date, 'MMM yyyy');

  // component will fail if we don't register the font first
  // this is also inside the component as a useEffect hook as we have to reference
  // the font from our public folder, and nextJS doesn't have e webpack loader specifically
  // for this
  useEffect(() => {
    if (!hasRegisteredFont) {
      Font.register({
        family: '"Noto Sans"',
        fonts: [
          {
            src: `${window.location.origin}/fonts/NotoSansThai-Bold.ttf`,
          },
        ],
      });
      globalHasRegisteredFont = true;
      setHasRegisteredFont(true);
    }
  }, []);

  const getStyle = useCallback(
    (key: DefaultStyleKeys) => {
      let style: Style = defaultStyles[key];

      if (styles && styles[key]) {
        style = { ...style, ...styles[key] };
      }

      return style;
    },
    [styles],
  );

  if (!hasRegisteredFont) return null;

  return (
    <Document>
      <Page size="A4" orientation={orientation}>
        <View style={getStyle('imageView')}>
          <Image style={getStyle('image')} src={templateUrl} />
        </View>
        <View
          style={
            orientation === 'portrait'
              ? getStyle('nameViewVertical')
              : getStyle('nameViewHorizontal')
          }
        >
          <Text style={getStyle('name')}>{name}</Text>
        </View>
        <View
          style={
            orientation === 'portrait'
              ? getStyle('titleViewVertical')
              : getStyle('titleViewHorizontal')
          }
        >
          <Text style={getStyle('title')}>{title}</Text>
        </View>
        <View
          style={
            orientation === 'portrait'
              ? getStyle('dateViewVertical')
              : getStyle('dateViewHorizontal')
          }
        >
          <Text style={getStyle('date')}>{formattedDate}</Text>
        </View>
      </Page>
    </Document>
  );
};
