(function() {
  if (typeof Prism === "undefined" || typeof document === "undefined" || !document.createRange) {
    return;
  }
  Prism.plugins.KeepMarkup = true;
  Prism.hooks.add("before-highlight", function(env) {
    if (!env.element.children.length) {
      return;
    }
    if (!Prism.util.isActive(env.element, "keep-markup", true)) {
      return;
    }
    var dropTokens = Prism.util.isActive(env.element, "drop-tokens", false);
    function shouldKeep(element) {
      if (dropTokens && element.nodeName.toLowerCase() === "span" && element.classList.contains("token")) {
        return false;
      }
      return true;
    }
    var pos = 0;
    var data = [];
    function processElement(element) {
      if (!shouldKeep(element)) {
        processChildren(element);
        return;
      }
      var o = {
        element,
        posOpen: pos
      };
      data.push(o);
      processChildren(element);
      o.posClose = pos;
    }
    function processChildren(element) {
      for (var i = 0, l = element.childNodes.length; i < l; i++) {
        var child = element.childNodes[i];
        if (child.nodeType === 1) {
          processElement(child);
        } else if (child.nodeType === 3) {
          pos += child.data.length;
        }
      }
    }
    processChildren(env.element);
    if (data.length) {
      env.keepMarkup = data;
    }
  });
  Prism.hooks.add("after-highlight", function(env) {
    if (env.keepMarkup && env.keepMarkup.length) {
      var walk = function(elt, nodeState) {
        for (var i = 0, l = elt.childNodes.length; i < l; i++) {
          var child = elt.childNodes[i];
          if (child.nodeType === 1) {
            if (!walk(child, nodeState)) {
              return false;
            }
          } else if (child.nodeType === 3) {
            if (!nodeState.nodeStart && nodeState.pos + child.data.length > nodeState.node.posOpen) {
              nodeState.nodeStart = child;
              nodeState.nodeStartPos = nodeState.node.posOpen - nodeState.pos;
            }
            if (nodeState.nodeStart && nodeState.pos + child.data.length >= nodeState.node.posClose) {
              nodeState.nodeEnd = child;
              nodeState.nodeEndPos = nodeState.node.posClose - nodeState.pos;
            }
            nodeState.pos += child.data.length;
          }
          if (nodeState.nodeStart && nodeState.nodeEnd) {
            var range = document.createRange();
            range.setStart(nodeState.nodeStart, nodeState.nodeStartPos);
            range.setEnd(nodeState.nodeEnd, nodeState.nodeEndPos);
            nodeState.node.element.innerHTML = "";
            nodeState.node.element.appendChild(range.extractContents());
            range.insertNode(nodeState.node.element);
            range.detach();
            return false;
          }
        }
        return true;
      };
      env.keepMarkup.forEach(function(node) {
        walk(env.element, {
          node,
          pos: 0
        });
      });
      env.highlightedCode = env.element.innerHTML;
    }
  });
})();
