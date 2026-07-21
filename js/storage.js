"use strict";

/**
 * BloxdTool Storage
 * Version: 1.0.0
 *
 * 保存処理専用
 */
class StorageManager {

    static STORAGE_KEY = "bloxdtool.measurements";

    /**
     * 測定データ保存
     * @param {Array} measurements
     */
    static save(measurements) {

        try {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(measurements)
            );

        }
        catch (error) {

            console.error(error);

        }

    }

    /**
     * 測定データ読み込み
     * @returns {Array}
     */
    static load() {

        try {

            const json =
                localStorage.getItem(
                    this.STORAGE_KEY
                );

            if (!json) {

                return [];

            }

            return JSON.parse(json);

        }
        catch (error) {

            console.error(error);

            return [];

        }

    }

    /**
     * 保存データ削除
     */
    static clear() {

        localStorage.removeItem(
            this.STORAGE_KEY
        );

    }

    /**
     * JSON文字列を出力
     * @param {Array} measurements
     * @returns {string}
     */
    static exportJSON(measurements) {

        return JSON.stringify(
            measurements,
            null,
            4
        );

    }

    /**
     * JSON文字列から読み込み
     * @param {string} json
     * @returns {Array}
     */
    static importJSON(json) {

        try {

            const data =
                JSON.parse(json);

            if (!Array.isArray(data)) {

                throw new Error(
                    "Invalid JSON."
                );

            }

            return data;

        }
        catch (error) {

            alert(
                "JSONの読み込みに失敗しました。"
            );

            console.error(error);

            return [];

        }

    }

}
