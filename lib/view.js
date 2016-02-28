var view = (function() {
  var _render = function(data, format) {
    console.log(data);
    return data;
  };
  return {
    render: _render,
  };
})();

module.exports = view;
