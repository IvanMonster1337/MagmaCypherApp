const magmaCypher = require('./build/Release/magma_cypher');

const str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In volutpat purus eu elit tempor, id ultricies nulla commodo. Proin bibendum tellus quis sapien aliquam, eleifend tristique nisl aliquet. Nunc nisi elit, mattis a luctus laoreet, pharetra a leo. Proin hendrerit massa mauris, quis consectetur purus finibus tincidunt. Aliquam suscipit porta neque. Fusce laoreet scelerisque ligula ac viverra. Maecenas posuere vehicula nisi in blandit. Sed vehicula vulputate nisi. Praesent risus nisl, dapibus non facilisis at, convallis at nibh. Proin quis imperdiet ex. Aenean enim turpis, commodo ut mauris vel, pretium molestie tortor. Nulla nibh erat, fermentum vel luctus sed, vestibulum nec diam. Nam accumsan non est nec tincidunt. Cras urna augue, faucibus eget sagittis ut, accumsan ac lorem. Duis eros mauris, fermentum sit amet elementum sit amet, consectetur id ex. Maecenas iaculis mi quis turpis malesuada, non volutpat tortor mollis. Curabitur tempor finibus laoreet. Curabitur vel pharetra justo. Nulla id nisl facilisis, luctus nisl sed, suscipit nulla. Praesent maximus eleifend enim, et eleifend nibh rhoncus quis. Etiam nec scelerisque dui, sit amet dictum justo. Vivamus tristique, ante et vestibulum posuere, justo massa aliquam urna, vel viverra leo tortor in ex. Phasellus sit amet interdum magna. Mauris tempus mauris at velit pretium mollis. Nam at posuere magna. Ut ultrices purus id rutrum maximus. Integer sollicitudin justo felis, id pellentesque augue aliquam ac. Morbi scelerisque turpis ac velit porta, vitae ullamcorper nulla ultricies. Vestibulum imperdiet ullamcorper turpis, fringilla pulvinar felis imperdiet sed. Sed rhoncus elementum vehicula. Donec non ultricies diam. Praesent sollicitudin, leo nec iaculis scelerisque, nunc erat volutpat massa, quis lacinia erat ante eget nulla. Mauris eu fringilla felis, sit amet hendrerit est. Vestibulum dignissim erat nisi, ut viverra nibh porta congue. Maecenas ultricies vulputate dignissim. Phasellus venenatis faucibus elit id scelerisque. Aenean justo augue, lobortis non lobortis eu, lacinia nec erat. Maecenas et elit dolor. Nullam suscipit ligula non neque mattis, vel tristique nulla molestie. Duis in odio eget felis sagittis scelerisque. Nulla facilisi. Vestibulum tristique justo at semper maximus. Vivamus lacinia urna euismod sollicitudin tempus. Duis ac augue eu purus pharetra tempus vitae sed dolor. Sed rutrum feugiat dui sed pharetra.";
let result = magmaCypher.encrypt(strEncodeUTF8(str));
console.log(result);
let res = String.fromCharCode.apply(null, new Uint8Array(result));
console.log(res);
let decrResult = magmaCypher.decrypt(strEncodeUTF8(res));
console.log(decrResult);
console.log(String.fromCharCode.apply(null, new Uint8Array(decrResult)));

function strEncodeUTF8(str) {
  str = str.toString();
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
      if(str.charCodeAt[i] > 255){
          throw new Error('String contains wrong symbols');
      }

      bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}