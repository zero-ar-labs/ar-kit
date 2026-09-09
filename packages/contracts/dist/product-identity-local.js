/**
 * The local data directory.
 *
 * What this is: the one name for where Local Lite keeps its profile state
 * under a working directory, derived from the identity artifact so no
 * process spells it by hand.
 */
import { SUCCESSOR_PRODUCT_IDENTITY } from "./product-identity.generated.js";
export function productLocalDataDirectory() {
    return SUCCESSOR_PRODUCT_IDENTITY.local_data_directory;
}
