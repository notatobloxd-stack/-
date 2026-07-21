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

// ===============================
// Data
// ===============================

let measurements = StorageManager.load();

const map = new MapRenderer(canvas);

// ===============================
// 初期化
// ===============================

renderMeasurements();
map.render(measurements);

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

    if (
        measurements.length === 0
    ) {

        measurementList.innerHTML =

        "<p class='placeholder'>まだ測定データはありません。</p>";

        return;

    }

    measurements.forEach(

        (m, index) => {

            const div =
                document.createElement("div");

            div.className =
                "measurement";

            div.innerHTML =

            `
            <strong>#${index + 1}</strong><br>

            X : ${m.x}<br>

            Z : ${m.z}<br>

            Distance : ${m.distance}m
            `;

            measurementList.appendChild(
                div
            );

        }

    );

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

    StorageManager.clear();

    renderMeasurements();

    map.render([]);

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
