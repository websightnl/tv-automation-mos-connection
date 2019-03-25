"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MosString128 {
    /** */
    constructor(str) {
        this.string = str;
    }
    /** */
    toString() {
        return this._str;
    }
    /** */
    set string(str) {
        if (typeof str === 'object' && str) {
            if (str.text) {
                this._str = '' + str.text + '';
            }
            else if (str._str) {
                this._str = '' + str._str + '';
            }
            else if (Object.keys(str).length === 0) { // is empty?
                this._str = '';
            }
            else {
                this._str = JSON.stringify(str);
            }
        }
        else {
            this._str = '' + str + '';
        }
        this._validate();
    }
    /** */
    _validate() {
        if ((this._str || '').length > 128)
            throw new Error('MosString128 length is too long (' + this._str + ')!');
    }
}
exports.MosString128 = MosString128;
//# sourceMappingURL=mosString128.js.map