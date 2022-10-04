import MarkCore from "../src";
import DEFAULT from "./testData";

const container = document.querySelector<HTMLDivElement>("#editor");

import EmojiPicker from "../src/ui/emojiPicker";
import FormatPicker from "../src/ui/formatPicker";
// import ImagePicker from '../src/ui/imagePicker'
import ImageSelector from "../src/ui/imageSelector";
import ImageToolBar from "../src/ui/imageToolbar";
import ImageTransformer from "../src/ui/transformer";
import CodePicker from "../src/ui/codePicker";
// import TableColumnTools from "../src/ui/tableColumnTools";
import QuickInsert from "../src/ui/quickInsert";
// import TableDragBar from "../src/ui/tableDragBar";
import TableTools from "../src/ui/tableTools";
// import PreviewTools from "../src/ui/previewTools";

// import FrontButton from "../src/ui/frontButton";
import FrontMenu from "../src/ui/frontMenu";

MarkCore.use(EmojiPicker)
MarkCore.use(FormatPicker)
// MarkCore.use(ImagePicker)
MarkCore.use(ImageSelector, {
//   unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY
})
MarkCore.use(ImageToolBar)
MarkCore.use(ImageTransformer)
MarkCore.use(CodePicker)

// MarkCore.use(FrontButton)
MarkCore.use(FrontMenu)
// MarkCore.use(TableColumnTools)
MarkCore.use(QuickInsert)
// MarkCore.use(TableDragBar)
MarkCore.use(TableTools)
// MarkCore.use(PreviewTools)
const muya = new MarkCore(container, {
  json: DEFAULT.state,
  disableHtml: true,
});

(window as any).muya = muya;

muya.init();
