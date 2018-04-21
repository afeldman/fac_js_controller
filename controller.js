'use strict'

/**
 * Karel DataTypes enumeration to send the right datatype to KAREL. The KAREL
 * datatypes are referenced with corresponding integers.
 * @readonly
 * @enum {number}
 */
var KAREL_TYPE = {
  /** karel data type INTEGER */
  INTEGER : 16,
  /** karel data type REAL */
  REAL : 17,
  /** karel data type REAL */
  BOOLEAN : 18,
  /** karel data type STRING */
  STRING : 209
};

/**
 * usually a FANUC Controller class from extern gequires a connection
 * desctiption. Because this class runs only on the controller no inputs are
 * required
 * @constructor
 */
var Controller = function() {};

/**
 * To send data to KAREL this functions uses a jQuery. The result can be
 * different, depending on the requested data. So a callback function is set to
 * work with the data.
 *
 * @param {String} program_call  the KAREL programm name
 * @param {Function} callback    the callback function to process the answer of
 *the KAREL program
 */
Controller.prototype.KAREL = function(program_call, callback) {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      callback(this.responseText); // call back function on the responce text
    }
  };

  xhttp.open('GET', '/KAREL/'.concat(program_call),
             false); // open the connection with a getting method. The setup has
  // to be syncronious so the last value of this function is
  // set to false. this synchronious, asyncronious flag is
  // deprecated in future java script versions, becuase using
  // this flags can cause into errors
  xhttp.send(null); // is is the get method. get is faster then post and the
                    // fanuc robot controller supports get not post
};

/**
 * get a system variable. This is just a shortcut for the <b>get_sys_var</b>
 * function
 *
 * @see {@link get_sys_var}
 *
 * @param {String} variable name of the system variable
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.get_var = function(
    variable) { return this.get_sys_var(variable) };

/**
 * get a system variable
 *
 * @param {String} variable name of the system variable
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.get_sys_var = function(variable) {
  var res; // local result

  function parse_var(response) {
    res = JSON3.parse(response);
  }; // callback function to get the data as json tree

  this.KAREL('getjssysvar?name=' + variable,
             parse_var); // jquery for sys variable

  return [ variable, res ]; // result
};

/**
 * get a variable by a abitrary program
 *
 * @param {String} variable  name of the program variable
 * @param {String} program  name of the program
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.get_prog_var = function(variable, prog) {
  var res; // the local result as json tree structure

  function parse_var(response) {
    res = JSON3.parse(response);
  }; // the callback function to get a json tree structure

  this.KAREL('getjsvar?name=' + variable + '&prog=' + prog,
             parse_var); // send the information as jquery to get the variable
                         // of an abitrary karel program

  return [ variable, res ]; // result string
};

/**
 * set a system variable. This is just a shortcut for the <b>set_sys_var</b>
 * function
 *
 * @see {@link set_sys_var}
 *
 * @param {String} variable name of the system variable
 * @param {String} value the value is a string because of the jquery.
 * @param {KAREL_TYPE} karel_type The Karel datatype
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.set_var = function(
    variable, value,
    karel_type) { return this.set_sys_var(variable, value, karel_type); };

/**
 * set a system variable. The value in the jquery has to be in a special
 * datatype. So the Datatype is part of the jquery. This means, that the value
 * can translated in a karel program into the right datatype so the value is set
 * correctly into the set ov karel system fariables.
 *
 * @see {@link KAREL_TYPE}
 *
 * @param {String} variable name of the system variable
 * @param {String} value the value is a string because of the jquery.
 * @param {KAREL_TYPE} karel_type The Karel datatype
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.set_sys_var = function(variable, value, karel_type) {
  var res; // local json tree variable

  function parse_var(response) {
    res = JSON3.parse(response);
  }; // callback function to barse karel export into a json tree

  this.KAREL('setjssysvar?name=' + variable + '&value=' + value +
                 '&type=' + karel_type,
             parse_var); // the jquery

  return [
    variable, res
  ]; // return the variable and the result string as json tree
};

/**
 * set a program variable. The value in the jquery has to be in a special
 * datatype. So the Datatype is part of the jquery. This means, that the value
 * can translated in a karel program into the right datatype so the value is set
 * correctly into the set ov karel system fariables.
 *
 * @param {String} variable name of the system variable
 * @param {String} value the value is a string because of the jquery.
 * @param {KAREL_TYPE} karel_type The Karel datatype
 * @param {String} prog the Karel program name
 *
 * @return {Array} the varibale and a json tree.
 */
Controller.prototype.set_prog_var = function(variable, value, karel_type,
                                             prog) {
  var res;

  function parse_var(response) { res = JSON3.parse(response); };

  this.KAREL('setjsvar?name=' + variable + '&value=' + value +
                 '&type=' + karel_type + '&prog=' + prog,
             parse_var);

  return [ variable, res ];
};

/**
 * In the basic JavaScript it is not possible to check for filesystem data. This
 * function checks if a questioned file is available on the controller.
 *
 * @param {String} filename the file name
 *
 * @return {Array} the result of a json tree in an array.
 */
Controller.prototype.check_file = function(filename) {
  var res; // local variable

  function parse_var(response) { res = JSON3.parse(response); }; // json parser

  this.KAREL('chkjsfs?filename=' + filename,
             parse_var); // the jquerry to the karel program

  return [
    res
  ]; // the result responce pared in a json structure and handover using a array
};

/**
 * To send data to KCL engine using a jQuery. The result can be
 * different, depending on the requested data. So a callback function is set to
 * work with the data.
 *
 * @param {String} program_call  the KAREL program name
 *
 * @return {String} the kcl responce
 */
Controller.prototype.KCL = function(program_call) {
  function parse_html(html_string) {
    var parser, xmlDoc;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(html_string.responseText, "text/html");
    
    return xmlDoc.getElementsByTagName("XMP")[0].innerHTML;
  };

  var xhttp = new XMLHttpRequest();
  var ret = null;

    xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {

      ret = parse_html(this);
    }
  };

  xhttp.open('GET', '/KCL/'.concat(program_call),
             false); // open the connection with a getting method. The setup has
  // to be syncronious so the last value of this function is
  // set to false. this synchronious, asyncronious flag is
  // deprecated in future java script versions, becuase using
  // this flags can cause into errors
  xhttp.send(null); // is is the get method. get is faster then post and the
    // fanuc robot controller supports get not post

    return ret;
};
