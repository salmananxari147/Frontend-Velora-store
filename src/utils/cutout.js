function colorDist(data, index, bg) {
  return Math.hypot(data[index] - bg[0], data[index + 1] - bg[1], data[index + 2] - bg[2]);
}

function cornerColor(data, width, height) {
  const spots = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  const totals = [0, 0, 0];
  spots.forEach(([x, y]) => {
    const index = (y * width + x) * 4;
    totals[0] += data[index];
    totals[1] += data[index + 1];
    totals[2] += data[index + 2];
  });
  return totals.map((value) => value / spots.length);
}

export function cutoutProduct(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const max = 1000;
        const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, width, height);
        const frame = context.getImageData(0, 0, width, height);
        const { data } = frame;
        const bg = cornerColor(data, width, height);
        const seen = new Uint8Array(width * height);
        const queue = [];

        const seed = (x, y) => {
          const id = y * width + x;
          if (seen[id]) return;
          seen[id] = 1;
          queue.push(id);
        };
        for (let x = 0; x < width; x += 1) {
          seed(x, 0);
          seed(x, height - 1);
        }
        for (let y = 0; y < height; y += 1) {
          seed(0, y);
          seed(width - 1, y);
        }

        while (queue.length) {
          const id = queue.pop();
          const index = id * 4;
          const lum = (data[index] + data[index + 1] + data[index + 2]) / 3;
          const dist = colorDist(data, index, bg);
          const nearWhite = lum > 246 && Math.max(data[index], data[index + 1], data[index + 2]) - Math.min(data[index], data[index + 1], data[index + 2]) < 18;
          if (dist > 42 && !nearWhite) continue;
          data[index + 3] = dist < 28 || nearWhite ? 0 : Math.round(((dist - 28) / 14) * 160);
          const x = id % width;
          const y = (id - x) / width;
          if (x > 0) seed(x - 1, y);
          if (x < width - 1) seed(x + 1, y);
          if (y > 0) seed(x, y - 1);
          if (y < height - 1) seed(x, y + 1);
        }

        let kept = 0;
        let center = 0;
        const x0 = Math.floor(width * 0.28);
        const x1 = Math.floor(width * 0.72);
        const y0 = Math.floor(height * 0.28);
        const y1 = Math.floor(height * 0.72);
        for (let y = y0; y < y1; y += 2) {
          for (let x = x0; x < x1; x += 2) {
            center += 1;
            if (data[(y * width + x) * 4 + 3] > 180) kept += 1;
          }
        }
        if (center && kept / center < 0.45) {
          resolve('');
          return;
        }
        context.putImageData(frame, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve('');
      }
    };
    image.onerror = () => resolve('');
    image.src = src;
  });
}
