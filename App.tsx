import {Canvas, Image, Skia, SkImage} from '@shopify/react-native-skia';
import React, {useEffect} from 'react';
import {Dimensions, PixelRatio} from 'react-native';
import {runOnUI, useSharedValue} from 'react-native-reanimated';

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
const ratio = PixelRatio.get();

export default function App() {
  const texture = useSharedValue<SkImage | null>(null);

  useEffect(() => {
    setTimeout(() => {
      runOnUI(() => {
        const offscreenCanvasWidth = WINDOW_WIDTH * ratio;
        const offscreenCanvasHeight = WINDOW_HEIGHT * ratio;
        console.log('offscreenCanvasWidth', offscreenCanvasWidth);
        console.log('offscreenCanvasHeight', offscreenCanvasHeight);

        const rootSurface = Skia.Surface.MakeOffscreen(
          WINDOW_WIDTH * ratio,
          WINDOW_HEIGHT * ratio,
        );

        if (!rootSurface) {
          return;
        }

        const offscreenSurface = Skia.Surface.MakeOffscreen(
          offscreenCanvasWidth,
          offscreenCanvasHeight,
        );
        if (!offscreenSurface) {
          return;
        }

        offscreenSurface.flush();

        const black = Skia.Color('black');
        const red = Skia.Color('red');

        const canvas = offscreenSurface.getCanvas();

        const snapshots: SkImage[] = [];

        for (let i = 0; i < 10; i++) {
          const now = performance.now();
          canvas.clear(i % 2 ? black : red);

          offscreenSurface.flush();

          const snapshot = offscreenSurface.makeImageSnapshot();

          // snapshot.readPixels();
          console.log('offscreen snapshot', performance.now() - now);

          snapshots.push(snapshot);
        }

        canvas.scale(ratio, ratio);

        const rootSurfaceCanvas = rootSurface.getCanvas();

        const now = performance.now();

        for (let i = 0; i < 10; i++) {
          const snapshot = snapshots[i];

          rootSurfaceCanvas.drawImage(snapshot, i * 10, i * 10);
        }

        rootSurface.flush();
        const image = rootSurface.makeImageSnapshot();
        texture.value = image;
        const end = performance.now();
        console.log('draw image', end - now);
      })();
    }, 1000);
  }, []);

  return (
    <Canvas style={{width: WINDOW_WIDTH, height: WINDOW_HEIGHT}}>
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
