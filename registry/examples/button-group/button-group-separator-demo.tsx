import { CopyIcon, ClipboardPasteIcon } from "lucide-react";

import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";

export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup>
      <Button leftSection={<CopyIcon />} variant="secondary">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button leftSection={<ClipboardPasteIcon />} variant="secondary">
        Paste
      </Button>
    </ButtonGroup>
  );
}
