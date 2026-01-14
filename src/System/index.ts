import { CsString } from '../Domain/ValueObjects/CsString';
import { Console } from './Console';
import { List } from './Collections/Generic/List';

export const System = {
    String: CsString,
    Console: Console,
    Collections: {
        Generic: {
            List: List
        }
    }
};
