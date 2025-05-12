import {
  Canvas,
  Image,
  rect,
  Skia,
  SkImage,
  SkSurface,
} from '@shopify/react-native-skia';
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
        const black = Skia.Color('black');
        const red = Skia.Color('red');

        const offscreenCanvasWidth = WINDOW_WIDTH * ratio;
        const offscreenCanvasHeight = WINDOW_HEIGHT * ratio;
        console.log('offscreenCanvasWidth', offscreenCanvasWidth);
        console.log('offscreenCanvasHeight', offscreenCanvasHeight);

        const rootSurface = Skia.Surface.MakeOffscreen(
          offscreenCanvasWidth,
          offscreenCanvasHeight,
        );

        if (!rootSurface) {
          return;
        }

        const rootSurfaceCanvas = rootSurface.getCanvas();

        rootSurfaceCanvas.drawColor(black);

        rootSurface.flush();

        const surfaces: SkSurface[] = [];

        for (let i = 0; i < 10; i++) {
          const offscreenSurface = Skia.Surface.MakeOffscreen(
            offscreenCanvasWidth,
            offscreenCanvasHeight,
          );

          if (!offscreenSurface) {
            return;
          }

          surfaces.push(offscreenSurface);
        }

        const snapshots: SkImage[] = [];

        const bounds = rect(0, 0, WINDOW_WIDTH * ratio, WINDOW_HEIGHT * ratio);

        for (let i = 0; i < surfaces.length; i++) {
          const offscreenSurface = surfaces[i];
          const canvas = offscreenSurface.getCanvas();

          canvas.drawColor(i % 2 ? black : red);

          const start1 = performance.now();
          offscreenSurface.flush();

          const snapshot = offscreenSurface.makeImageSnapshot(bounds);

          console.log('makeImageSnapshot', performance.now() - start1);

          snapshots.push(snapshot);
        }

        function draw() {
          const now = performance.now();

          for (let i = 0; i < snapshots.length; i++) {
            const snapshot = snapshots[i];

            rootSurfaceCanvas.drawImage(snapshot, i * 10, i * 10);
          }

          rootSurface.flush();
          const image = rootSurface.makeImageSnapshot();
          texture.value = image;

          const end = performance.now();
          console.log('draw image', end - now);
        }

        draw();

        draw();

        draw();
      })();
    }, 5000);
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
