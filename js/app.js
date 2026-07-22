"use strict";

/**
 * BloxdTool
 * App Controller
 * Version 1.0.0
 */

// ===============================
// DOM
// ===============================

const playerXInput = document.getElementById("playerX");
const playerZInput = document.getElementById("playerZ");
const distanceInput = document.getElementById("distance");

const addButton = document.getElementById("addMeasurement");
const clearButton = document.getElementById("clearMeasurements");
const solveButton = document.getElementById("solveButton");

const measurementList =
    document.getElementById("measurementList");

const resultElement =
    document.getElementById("result");

const canvas =
    document.getElementById("mapCanvas");

const heatmapToggle =
document.getElementById(
    "heatmapToggle"
);

const measurementInfo =
document.getElementById(
    "measurementInfo"
);

// ===============================
// Data
// ===============================

let measurements = StorageManager.load();

// 最後の計算結果を保存
let lastResult = null;

const map = new MapRenderer(canvas);

map.setMeasurementSelectedCallback(

    (index)=>{

        if(index<0){

            measurementInfo.innerHTML=`

<h3>📍 選択中の測定</h3>

<p class="placeholder">

測定点をクリックしてください

</p>

`;

            return;

        }

        const m=measurements[index];

        measurementInfo.innerHTML=`

<h3>📍 選択中の測定</h3>

<p><b>#${index+1}</b></p>

<p>X : ${m.x}</p>

<p>Z : ${m.z}</p>

<p>距離 : ${m.distance}m</p>

`;

    }

);

// ===============================
// 初期化
// ===============================

renderMeasurements();
map.render(measurements);

heatmapToggle.checked =
true;

// ===============================
// Events
// ===============================

addButton.addEventListener(
    "click",
    addMeasurement
);

clearButton.addEventListener(
    "click",
    clearMeasurements
);

// Commit2で実装
solveButton.addEventListener(
    "click",
    solveMeasurements
);

distanceInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        addMeasurement();

    }

});

heatmapToggle.addEventListener(

    "change",

    () => {

        map.setHeatmapVisible(

            heatmapToggle.checked

        );

        map.render(

            measurements,

            lastResult

        );

    }

);

// ===============================
// 測定追加
// ===============================

function addMeasurement() {

    const x =
        Number(playerXInput.value);

    const z =
        Number(playerZInput.value);

    const distance =
        Number(distanceInput.value);

    if (

        Number.isNaN(x) ||

        Number.isNaN(z) ||

        Number.isNaN(distance)

    ) {

        alert("数値を入力してください。");

        return;

    }

    measurements.push({

        x,

        z,

        distance

    });

    StorageManager.save(
        measurements
    );

    renderMeasurements();

    map.render(
        measurements
    );

    playerXInput.value = "";
    playerZInput.value = "";
    distanceInput.value = "";

    playerXInput.focus();

}

// ===============================
// 一覧更新
// ===============================

function renderMeasurements() {

    measurementList.innerHTML = "";

    if (measurements.length === 0) {

        measurementList.innerHTML =
            "<p class='placeholder'>まだ測定データはありません。</p>";

        return;

    }

    measurements.forEach((m, index) => {

        const div = document.createElement("div");

        div.className = "measurement";

        div.innerHTML = `
            <strong>#${index + 1}</strong><br>

            X : ${m.x}<br>
            Z : ${m.z}<br>
            Distance : ${m.distance}m

            <br><br>

            <button class="editMeasurement" data-index="${index}">
    ✏ 編集
</button>

<button class="deleteMeasurement" data-index="${index}">
    🗑 この測定を削除
</button>
        `;

        measurementList.appendChild(div);

    });

document.querySelectorAll(".editMeasurement").forEach(button => {

    button.addEventListener("click", () => {

        const index = Number(button.dataset.index);

        editMeasurement(index);

    });

});
    
    // 削除ボタン
    document.querySelectorAll(".deleteMeasurement").forEach(button => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);

            deleteMeasurement(index);

        });

    });

}

// ===============================
// 全削除
// ===============================

function clearMeasurements() {

    if (

        !confirm(

            "測定データを削除しますか？"

        )

    ) {

        return;

    }

    measurements = [];

    lastResult = null;

    StorageManager.clear();

    renderMeasurements();

    map.render([]);

    resultElement.innerHTML =

    "<p class='placeholder'>推定開始を押すと表示されます。</p>";

}

function editMeasurement(index) {

    const m = measurements[index];

    const x = prompt("X座標", m.x);

    if (x === null) return;

    const z = prompt("Z座標", m.z);

    if (z === null) return;

    const distance = prompt("距離", m.distance);

    if (distance === null) return;

    measurements[index] = {

        x: Number(x),

        z: Number(z),

        distance: Number(distance)

    };

    StorageManager.save(measurements);

    renderMeasurements();

    map.render(measurements);

    lastResult = null;

    resultElement.innerHTML =
        "<p class='placeholder'>推定開始を押してください。</p>";

}

function deleteMeasurement(index) {

    measurements.splice(index, 1);

    lastResult = null;

    StorageManager.save(measurements);

    renderMeasurements();

    map.render(measurements);

    resultElement.innerHTML =
        "<p class='placeholder'>推定開始を押すと表示されます。</p>";

}

// ===============================
// Commit2で実装
// ===============================

function solveMeasurements() {

    if (measurements.length < 2) {

        alert("2回以上測定してください。");

        return;

    }

    let result;

    try {

        result = solveCoordinates(measurements);

    }
    catch (error) {

        console.error(error);

        alert("計算中にエラーが発生しました。");

        return;

    }

lastResult = result;
    
    resultElement.innerHTML = `

        <h3>推定結果</h3>

        <p><strong>X:</strong> ${result.x.toFixed(1)}</p>

        <p><strong>Z:</strong> ${result.z.toFixed(1)}</p>

        <hr>

        <p>信頼度：${result.confidence}%</p>

        <p>平均誤差：${result.averageError.toFixed(2)}m</p>

        <p>最大誤差：${result.maxError.toFixed(2)}m</p>

        <p>測定回数：${result.measurements}</p>

        <p>計算時間：${result.searchTime} ms</p>

    `;

    map.render(
        measurements,
        result
    );

}
