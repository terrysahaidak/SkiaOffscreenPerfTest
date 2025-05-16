import {Canvas, Image, Skia, SkImage} from '@shopify/react-native-skia';
import React, {useEffect} from 'react';
import {Dimensions, PixelRatio} from 'react-native';
import {runOnUI, useSharedValue} from 'react-native-reanimated';

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
const ratio = PixelRatio.get();

export default function App() {
  const texture = useSharedValue<SkImage | null>(null);

  useEffect(() => {
    runOnUI(() => {
      const white = Skia.Color('white');

      const offscreenCanvasWidth = WINDOW_WIDTH * ratio;
      const offscreenCanvasHeight = WINDOW_HEIGHT * ratio;
      console.log('offscreenCanvasWidth', offscreenCanvasWidth);
      console.log('offscreenCanvasHeight', offscreenCanvasHeight);

      const surface = Skia.Surface.MakeOffscreen(
        offscreenCanvasWidth,
        offscreenCanvasHeight,
      );

      if (!surface) {
        return;
      }

      const ctx = surface.getCanvas();

      function frame() {
        ctx.clear(white);

        if (surface) {
          surface?.flush();
          const prev = texture.value;
          texture.value = surface.makeImageSnapshot();
          prev?.dispose();
        }

        requestAnimationFrame(frame);
      }

      frame();
    })();
  }, []);

  return (
    <Canvas opaque style={{width: WINDOW_WIDTH, height: WINDOW_HEIGHT}}>
      <Image
        image={texture}
        x={0}
        y={0}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
      />
    </Canvas>
  );
}
