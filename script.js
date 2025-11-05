const canvas = document.getElementById('floatingShapesCanvas');
const ctx = canvas.getContext('2d');

let shapes = [];
let globalHue = 0; // 背景色の色相（色合い）を時間とともに変化させるための変数

// キャンバスのサイズを設定します
canvas.width = window.innerWidth; // ウィンドウの幅いっぱいに設定
canvas.height = window.innerHeight; // ウィンドウの高さっぱいに設定

// ウィンドウのサイズが変更されたときにキャンバスのサイズも調整します
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 図形の色をランダムに生成する関数（現在は使用していませんが、将来のために残しています）
function getRandomShapeColor(shapeHue) {
    // HSL (色相、彩度、明度) とアルファ値 (透明度) を使って色を返します
    return `hsla(${shapeHue}, 70%, 60%, ${shape.opacity})`;
}

// ランダムな図形（円、多角形、星）を生成する関数
function createShape() {
    // 図形の種類をランダムに選択します
    const shapeTypes = ['circle', 'polygon', 'star'];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    // 図形の初期位置をキャンバス内でランダムに決めます
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    // 図形の初期サイズをランダムに決めます（最小120、最大360）
    const initialSize = Math.random() * 240 + 120;

    // 図形の移動速度をランダムに決めます（全体的にゆっくりめ）
    const speedMultiplier = Math.random() * 0.7 + 0.3; // 0.3から1.0の範囲で速度を調整
    const speedX = (Math.random() - 0.5) * 0.7 * speedMultiplier; // X方向の速度
    const speedY = (Math.random() - 0.5) * 0.7 * speedMultiplier; // Y方向の速度

    // 図形が生成された時間、最低表示時間、消える確率を設定します
    const creationTime = Date.now();
    const minDisplayTime = 30000; // 最低30秒は表示されます
    const disappearChance = 0.0005; // 1フレームあたりの消える確率（低めに設定し、図形が増えやすくします）

    // 新しい図形の情報をオブジェクトとして作成します
    let shape = {
        type, // 図形の種類
        x, y, // 位置
        size: initialSize, // 現在のサイズ
        targetSize: initialSize, // 目標サイズ（サイズ変化用）
        speedX, speedY, // 移動速度
        creationTime, // 生成された時間
        minDisplayTime, // 最低表示時間
        disappearChance, // 消える確率
        // 多角形の場合は3〜5、星形の場合は5〜7の辺/点数をランダムに設定します
        sides: type === 'polygon' ? Math.floor(Math.random() * 3) + 3 : (type === 'star' ? Math.floor(Math.random() * 3) + 5 : 0),
        rotation: Math.random() * Math.PI * 2, // 初期回転角度
        rotationSpeed: (Math.random() - 0.5) * 0.02, // 回転速度
        scaleX: 1, // 縦横比（現在は固定）
        scaleY: 1, // 縦横比（現在は固定）
        hue: (globalHue + Math.random() * 180) % 360, // 個別の色相（背景色から少しずらす）
        hueSpeed: (Math.random() - 0.5) * 0.5, // 個別の色相変化速度
        opacity: 0, // 透明度（フェードインのために0から開始）
        fadingOut: false, // フェードアウト中かどうかのフラグ
        fadingIn: true, // フェードイン中かどうかのフラグ
        innerRadiusRatio: type === 'star' ? (Math.random() * 0.3 + 0.4) : 0 // 星形の内側半径の比率（星形の場合のみ設定）
    };
    shapes.push(shape); // 作成した図形をリストに追加します
}

// 図形を描画する関数
function drawShape(shape) {
    ctx.save(); // 現在のキャンバスの状態を保存します
    ctx.translate(shape.x, shape.y); // 図形の中心に原点を移動します
    ctx.rotate(shape.rotation); // 図形を回転させます

    // 図形の色と透明度を設定します
    ctx.fillStyle = `hsla(${shape.hue}, 70%, 60%, ${shape.opacity})`;
    ctx.beginPath(); // 新しいパスを開始します

    if (shape.type === 'circle') {
        // 円を描画します
        ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
    } else if (shape.type === 'polygon') {
        // 多角形を描画します
        const angleIncrement = (Math.PI * 2) / shape.sides; // 辺ごとの角度
        for (let i = 0; i < shape.sides; i++) {
            const angle = i * angleIncrement;
            const px = Math.cos(angle) * shape.size / 2;
            const py = Math.sin(angle) * shape.size / 2;
            if (i === 0) {
                ctx.moveTo(px, py); // 最初の点に移動
            } else {
                ctx.lineTo(px, py); // 次の点まで線を描画
            }
        }
        ctx.closePath(); // パスを閉じます
    } else if (shape.type === 'star') {
        // 星形を描画します
        const outerRadius = shape.size / 2; // 外側の点の半径
        const innerRadius = outerRadius * shape.innerRadiusRatio; // 内側の点の半径（生成時に決定された比率を使用）
        const angleIncrement = (Math.PI * 2) / (shape.sides * 2); // 星形は外側と内側の点があるので、辺の数の2倍で割ります
        for (let i = 0; i < shape.sides * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius; // 外側と内側の半径を交互に使用
            const angle = i * angleIncrement;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    }
    ctx.fill(); // パスを塗りつぶします
    ctx.restore(); // 保存したキャンバスの状態に戻します
}

// アニメーションループの関数
function animate() {
    // 背景色（グラデーション）を更新します
    globalHue = (globalHue + 0.1) % 360; // 全体の色相を少しずつ変化させます
    // パステルカラーの明るさを調整します（60%から80%の間で変化）
    const pastelLightness = 70 + Math.sin(globalHue * Math.PI / 180) * 10;
    const color1 = `hsl(${globalHue}, 70%, ${pastelLightness}%)`; // グラデーションの開始色
    const color2 = `hsl(${(globalHue + 60) % 360}, 70%, ${pastelLightness}%)`; // グラデーションの終了色

    let gradient;
    let x0, y0, x1, y1;

    // グラデーションの方向をランダムに設定します（滑らかな変化のため、頻繁には変更しません）
    if (Date.now() % 10000 < 16) { // 約10秒ごとに方向を変更
        const direction = Math.floor(Math.random() * 4); // 0: 左上から右下, 1: 右上から左下, 2: 上から下, 3: 左から右
        switch (direction) {
            case 0: x0 = 0; y0 = 0; x1 = canvas.width; y1 = canvas.height; break;
            case 1: x0 = canvas.width; y0 = 0; x1 = 0; y1 = canvas.height; break;
            case 2: x0 = canvas.width / 2; y0 = 0; x1 = canvas.width / 2; y1 = canvas.height; break;
            case 3: x0 = 0; y0 = canvas.height / 2; x1 = canvas.width; y1 = canvas.height / 2; break;
        }
        // 次のフレームでも同じ方向を使うために保存します
        canvas.dataset.gradientDirection = JSON.stringify({ x0, y0, x1, y1 });
    } else {
        // 保存されたグラデーションの方向を読み込みます
        const storedDirection = JSON.parse(canvas.dataset.gradientDirection || '{"x0":0,"y0":0,"x1":' + canvas.width + ',"y1":' + canvas.height + '}');
        x0 = storedDirection.x0; y0 = storedDirection.y0; x1 = storedDirection.x1; y1 = storedDirection.y1;
    }

    // 線形グラデーションを作成します
    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, color1); // 開始色を追加
    gradient.addColorStop(1, color2); // 終了色を追加

    ctx.fillStyle = gradient; // グラデーションを背景色に設定
    ctx.fillRect(0, 0, canvas.width, canvas.height); // キャンバス全体を塗りつぶします

    // すべての図形をループ処理します
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];

        // フェードインの処理
        if (shape.fadingIn) {
            shape.opacity += 0.02; // 透明度を少しずつ上げます
            if (shape.opacity >= 1) {
                shape.opacity = 1; // 透明度が最大になったらフェードイン終了
                shape.fadingIn = false;
            }
        }

        // フェードアウトの処理
        if (shape.fadingOut) {
            shape.opacity -= 0.02; // 透明度を少しずつ下げます
            if (shape.opacity <= 0) {
                shapes.splice(i, 1); // 透明度が0になったら図形を削除
                i--; // 配列から削除したのでインデックスを調整
                continue; // 次の図形へ
            }
        }

        // 図形の位置を更新します
        shape.x += shape.speedX;
        shape.y += shape.speedY;

        // 壁に当たったら跳ね返るようにします
        if (shape.x + shape.size / 2 > canvas.width || shape.x - shape.size / 2 < 0) {
            shape.speedX *= -1; // X方向の速度を反転
        }
        if (shape.y + shape.size / 2 > canvas.height || shape.y - shape.size / 2 < 0) {
            shape.speedY *= -1; // Y方向の速度を反転
        }

        // 図形のサイズを更新します
        if (Date.now() % 5000 < 16) { // 約5秒ごとに目標サイズを変更（頻度を下げました）
            shape.targetSize = Math.random() * 240 + 120; // 最小120、最大360
        }
        shape.size += (shape.targetSize - shape.size) * 0.005; // 滑らかなサイズ変化（速度をゆっくりにしました）
        // 縦横比は固定されているため、ここでは更新しません

        // 多角形と星形の回転を更新します
        if (shape.type === 'polygon' || shape.type === 'star') {
            shape.rotation += shape.rotationSpeed;
        }

        // 図形の色を時間とともに変化させます
        shape.hue = (shape.hue + shape.hueSpeed) % 360;
        if (shape.hue < 0) shape.hue += 360; // 色相が負にならないように調整

        // 最低表示時間を過ぎたらランダムに消える処理
        if (!shape.fadingOut && Date.now() - shape.creationTime > shape.minDisplayTime) {
            if (Math.random() < shape.disappearChance) {
                shape.fadingOut = true; // フェードアウトを開始します
            }
        }

        drawShape(shape); // 図形を描画します
    }

    // 画面上の図形が50個未満の場合、新しい図形を追加します（図形の総量を増やしました）
    if (shapes.length < 50) {
        createShape();
    }

    requestAnimationFrame(animate); // 次のフレームで再度アニメーション関数を呼び出します
}

// 初期表示のために、最初に20個の図形を生成します（数を増やしました）
for (let i = 0; i < 20; i++) {
    createShape();
}

animate(); // アニメーションを開始します
