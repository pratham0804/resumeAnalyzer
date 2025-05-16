import { auth } from "./auth";
import router from "./router";

const http = router;

auth.addHttpRoutes(http);

export default http;

Updated on 2025-05-16 10:31:26 - Change #2409

Updated on 2025-05-16 10:31:33 - Change #4737
