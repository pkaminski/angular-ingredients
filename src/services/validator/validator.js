/**
 * @overview A generic validation service for all your angular template needs.
 * @author Jacques Favreau
 * @version 20121207
 */

/**
 * @namespace validator
 * @example
 * <pre>
 *  //   Password is required and must be between 6 characters and 20 characters
 *  //   First name is required, has arbitrary javascript run on it.
 *
 * var validTest = {
 *     first_name: {
 *         pretty: 'first name',
 *         value: testName,
 *         validators: [
 *             {type: 'required'},
 *             {
 *                 type: 'javascript',
 *                 args: [
 *                     function(a){return true;},
 *                     testName
 *                 ],
 *                 failMsg: 'your first name was a complete failure'
 *             }
 *         ]
 *     },
 *     password: {
 *         pretty: 'password',
 *         value: testPass,
 *         validators: [
 *             {
 *                 type: 'required',
 *                 chained: [{
 *                     type: 'strLen',
 *                     args: [6, 20],
 *                 }]
 *             },
 *         ]
 *     }
 * };
 *
 * // What would come back if everything failed. Note the chained validator on password's 'require'
 * // validator was not checked because 'require' failed.
 * var retVal = {
 *     valid: false,
 *     errorText: {
 *         first_name: ['first name is required.', 'your first name was a complete failure.'],
 *         password: ['password is required.]
 *     }
 * };
 * </pre>
 *
 * In essence, you would end up injecting 'validator' into your controller, service, directive,
 * etc. and define what your form should validate to, bind your data in (in the above example this would
 * be the testName and testPass variables) and then call validator.check(validTest) where validTest
 * is a validationCollection object.
 */

angular.module('ingredients')

.factory('validator', [function () {
	'use strict';
                      /*---------------------------
                      | Validate! VALIDAAAATE!!!!! |
                      /----------------------------
                     /
         _n____n__
        /         \---||--<(O
       /___________\
       _|____|____|_
       _|____|____|_
        |    |    |
       --------------
       | || || || ||\
       | || || || || \++++++------<()
       ===============
       |   |  |  |   |
      (| O | O| O| O |)
      |   |   |   |   |
     (| O | O | O | O |)
      |   |   |   |    |
    (| O |  O | O  | O |)
     |   |    |    |    |
    (| O |  O |  O |  O |)
    \====================*/

	/**
	 * @typedef validationCollection
	 * @type {Object.<string, fieldValidation>}
	 * @description A collection of fieldValidation objects with the field name as the key.
	 */

	/**
	 * @typedef fieldValidation
	 * @type {Object}
	 * @description All of the validations for a single form field.
	 * @property {String} pretty The pretty-print name of the field being validated.
	 * @property {String|Boolean|Number} value The value of the field being validated.
	 * @property {Array.validationObject} validators An array of validationObjects to be checked.
	 */

	/**
	 * @typedef validationObject
	 * @type {Object}
	 * @description An object describing a single validation.
	 * @property {String} type The type of validator ('required', 'lt', etc.)
	 * @property {Array} [args] An array of the arguments the validator needs to run.
	 *                          See documentation for specific validators for what this should be.
	 * @property {String} [failMsg] An optional message to be returned if this validator fails.
	 *                              Otherwise, the default validation error for your validator
	 *                              will be used.
	 * @property {Array.validationObject} [chained] An array of any other validationObjects that
	 *                                              should be run if this validation passes. You
	 *                                              can use this if you want to limit the number of
	 *                                              errors a field can generate. For instance, you
	 *                                              might want an email field to be a) required,
	 *                                              and b) a valid email address. If the user
	 *                                              enters nothing, it's might be inelegant to
	 *                                              display "Email is required. Email must be a
	 *                                              valid."
	 */

	/**
	 * @typedef completeValidationReturnObject
	 * @type {Object}
	 * @property {Boolean} valid If the validation passed.
	 * @property {Object} errorText An object that is essentially an associative array of field
	 *                              name (that was passed in in the validationObjects) as they
	 *                              key and an array of strings as the value.
	 */

	/**
	 * @typedef validationReturnObject
	 * @type {Object}
	 * @property {Boolean} valid     If the validation passed.
	 * @property {String} errorText  The error text if the validation failed.
	 */

	/**
	 * General valid return
	 * @private
	 * @type {validationReturnObject}
	 */
	var VALID = {valid: true, errorText: ''};

	/**
	 * @memberOf validator
	 * @name validator#validators
	 * @namespace validators
	 */

	var validators = {
		/**
		 * Does nothing. Good for if your validator definition has some if/then logic in it.
		 * Something like:
		 * <pre>
		 * validators: [(a === b) ? {type: 'required'} : {type: 'noop'}]
		 * </pre>
		 * @params val    Not used in this validator.
		 * @param  pretty Not used in this validator.
		 * @param  args   Not used in this validator.
		 * @return {validationReturnObject}        Always returns valid.
		 */
		noop: function(val, pretty, args){
			return VALID;
		},

		/**
		 * Requires a field to have something in it.
		 *
		 * @function
		 * @name validators#required
		 * @param  {String|Boolean} val    The value to be checked.
		 * @param  {String} pretty The pretty-print name of the field being checked. Used in
		 *                         creating the default failure message.
		 * @param  {Array} [args]   Not used in this validator.
		 * @return {validationReturnObject}
		 */
		required: function(val, pretty, args){
			var isValid = true;

			if (typeof(val) === 'undefined') {
				isValid = false;
			} else if (typeof(val) === 'boolean') {
				isValid = val;
			} else if (typeof(val) === 'string') {
				isValid = val.replace(/^\s*(.*?)\s*$/, '$1') !== '';
			} else if (val === null) {
				isValid = false;
			}

			return isValid ? VALID : {valid: false, errorText: pretty + ' is required.'};
		},
		/**
		 * Requires a string field to be longer than a given number of characters.
		 *
		 * @function
		 * @name validators#strLen
		 * @param  {String} val    The string to be evaluated.
		 * @param  {String} pretty The pretty-print name of the field being checked. Used in
		 *                         creating the default failure message.
		 * @param  {Number[]} args The values for this validation. In the format
		 *                         [lowerBound, upperBound]. lowerBound and upperBound Either can
		 *                         be undefined and will not be checked. Normally they are exclusive bounds
		 *                         but if they are the same value, it will check for an exact length match.
		 * @return {validationReturnObject}
		 */
		strLen: function(val, pretty, args){
			// check if you got a string for a value
			// check if you got a pretty string
			//console.log([args, pretty, val]);
			if(typeof(val) !== 'string' || typeof(pretty) !== 'string' ||
				typeof(args) !== 'object' || args.length !== 2){
				console.error('Wrong parameters passed to strLen validator for ' + pretty);
			}
			var len = val.length;
			var lowerBound = args[0];
			var upperBound = args[1];

			// check if args are number or undefined
			// if both lowerBound and upperBound set
			if(typeof(lowerBound) === 'number' && typeof(upperBound) === 'number'){
				// Deal with the exact length case.
				if(lowerBound === upperBound && lowerBound !== len){
					return {
						valid: false,
						errorText: pretty + ' has to be exactly ' + upperBound +' characters long.'
					};
				}
				else if(len < lowerBound || len > upperBound){
					return {
						valid: false,
						errorText: pretty+' has to be between ' + lowerBound + ' and ' +
							upperBound + ' characters long.'
					};
				}
			}else{
				// if lowerBound set only
				if(typeof(lowerBound) === 'number' && len<lowerBound){
					return {
						valid: false,
						errorText: pretty + ' has to be more than ' + lowerBound +
							((lowerBound <= 1) ? ' character' : ' characters') + ' long.'
					};
				}
				// if upperBound set only
				else if(typeof(upperBound) === 'number' && len>upperBound){
					return{
							valid: false,
							errorText: pretty + ' has to be ' +
								((upperBound <= 1) ?
									'less than 1 character' :
									'fewer than ' + upperBound + ' characters') +
								' long.'
						};
				}
			}
			return VALID;
		},

		/**
		 * Validates if a string is made of numeric characters only.
		 *
		 * @function
		 * @name validators#numericString
		 * @param  {String} val    The string under test.
		 * @param  {String} pretty The pretty-print name of the field under test. Used in error
		 *                         messages.
		 * @param  {Array} args   The argument array. Not used in this validator.
		 * @return {validationReturnObject}        The return of this validation.
		 */
		numericString: function(val, pretty, args){
			// Deal with if the value isn't a string.
			if(typeof(val) !== 'string'){
				console.error('The numericString evaluator can only take in a string! You tried '+
					typeof(val));
				return {
					valid: false,
					errorText: 'The numericString evaluator can only take in a string! You tried '+
					typeof(val)
				};
			}

			// Test if the string is only made of numeric characters 0-9
			if(!/^[0-9]+$/.test(val)){
				return {valid: false, errorText: pretty+' can only be numeric characters.'};
			}
			return VALID;
		},

		/**
		 * Validates an email address
		 *
		 * @function
		 * @name validators#email
		 * @param  {String} val    The string under test.
		 * @param  {String} pretty The pretty-print name of the field under test. Used in error
		 *                         messages.
		 * @param  {Array} args   The argument array. Not used in this validator.
		 * @return {validationReturnObject}        The return of this validation.
		 */
		email:function(val, pretty, args){
			// Basic checking to stop some mess.
			if(typeof(val) !== 'string' || typeof(pretty) !== 'string'){
				console.error('Wrong parameters passed to email validator for ' + pretty);
			}
			var re = /^[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/i;
			if(re.test(val)){
				return VALID;
			}else{
				return {
					valid: false,
					errorText: pretty + ' has to be a valid email address.'
				};
			}
		},
		/**
		 * Validates that two values are equal
		 *
		 * @function
		 * @name validators#equal
		 * @param  {String|Number|Boolean} val    The string under test.
		 * @param  {String} pretty The pretty-print name of the field under test.
		 *                         Used in error messages.
		 * @param  {Array} args   The argument array in the following format
		 *                        [
		 *                            valueToCheckAgainst{String|Number|Boolean},
		 *                            prettyPrintNameOfValueToCheckAgainst{String}
		 *                        ]
		 * @return {validationReturnObject}        The return of this validation.
		 */
		equal: function(val, pretty, args){
			if((typeof(val) !== 'string' && typeof(val) !== 'number' && typeof(val) !== 'boolean') ||
				typeof(args) !== 'object' || args.length !== 2){
				console.error('Wrong parameters passed to equal validator for '+pretty);
			}
			if(typeof(val) !== 'string' && typeof(val) !== 'number' && typeof(val) !== 'boolean'){
				console.error(
					'Validator "Equal" only works for strings, numbers, and booleans. Tried ' +
					typeof(val)+' for '+pretty);
			}
			if(val === args[0]){
				return VALID;
			}else{
				return {
					valid: false,
					errorText: pretty + ' and ' + args[1] + ' have to be the same.'
				};
			}
		},

		/**
		 * Validate with a generic javascript validation
		 * @param  {String|Number|Boolean} val    The value under test.
		 * @param  {String} pretty The pretty-print name of the field under test.
		 *                         Used in error messages.
		 * @param  {Array} args   The argument array for the validation. The first
		 *                        argument MUST be the function to test. The function must return a
		 *                        boolean value. The subsequent values in args will be fed into the
		 *                        function as arguments as follows:
		 *                        <pre>
		 *                          args[0].call(undefined, [val, args[1], args[2],...])
		 *                        </pre>
		 *                        Odd format, I know, but it holds with the rest of the validators
		 *                        format and the major use case has been one value and one function
		 *                        which makes this format very simple.
		 * @return {validationReturnObject}        The return of this validation.
		 */
		javascript: function(val, pretty, args){
			var scr = args[0];
			var scrArgs = [val].concat(args.slice(1));
			var res = scr.apply(undefined, scrArgs);
			if(typeof(res)!=='boolean'){
				console.error('Javascript evaluator types must return only boolean values! This one returned '+res);
				return {
					valid: false,
					errorText: 'Validator for ' + pretty + ' should have returned a bool, but returned '+res
				};
			}
			if(!res){
				return {
					valid: false,
					errorText: pretty + ' failed validation with value ' + val
				};
			}
			else{return VALID;}
		},

		/**
		 * Validate a string against a regex. Will return as valid if any match is made, so make your
		 * regex ROBUST!
		 * @param  {String} val    The string under test
		 * @param  {String} pretty The pretty-print name of the field under test.
		 *                         Used in error messages.
		 * @param  {Array} args    The first (and only) value in this array is the regex object to
		 *                         check against.
		 * @return {validationReturnObject}        The return of this validation.
		 */
		regex: function(val, pretty, args){
			if(typeof(args[0])!=='object' || args[0] instanceof RegExp === false){
				console.error(
					'Regex evaluator types must have a regex value for arg[0] but got ' + args[0]);
				return {
					valid: false,
					errorText: 'Validator for ' + pretty + ' should be called with regex as arg[0]'
				};
			}
			if(typeof(val)!=='string'){
				console.error('Regex can only be called on a string! Tried to call it on ' + val +
					' for '+pretty);
				return {
					valid: false,
					errorText: 'Broken validator. Regex for ' + pretty + ' wasn\'t called on a string'
				};
			}
			if(val.match(args[0])){return VALID;}
			else{
				return {valid: false,errorText: pretty+' failed regex validation with value '+val};
			}
		},

		/**
		 * Checks if a string is a valid date.
		 * @param  {String} val     The string to be validated.
		 * @param  {String} pretty  The pretty print name of the field
		 *                          being validated.
		 *
		 * @return {validationReturnObject}     The return of this validation.
		 */
		dateString: function(val, pretty, args){
			var failVal = {
				valid: false,
				errorText: pretty+' must be a date of the format mm/dd/yyyy.'
			};
			var t = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
			if(t!==null){
				var d=+t[2], m=+t[1], y=+t[3];
				var date = new Date(y,m-1,d);
				if((''+date.getFullYear()).slice(-2)===(y+'').slice(-2) &&
					date.getMonth()===m-1){
						return VALID;
				}else{return failVal;}
			}else{return failVal;}
		}
	};
	return{
		/**
		 * This is the main validation routine. It will run over an object of validation objects
		 * and process each one.
		 * @function
		 * @name validator#check
		 * @param  {Object} vObjs An object of validation objects listed by element name.
		 * @return {completeValidationObject}
		 */
		check: function(vObjs){
			var vObj;
			var rObj = {valid: true, errorText: {}};
			var v;
			// loop over the validation objects.
			for (var i in vObjs){if(vObjs.hasOwnProperty(i)){
				// Loop over the validators for this validation object and run them.
				vObj = vObjs[i];
				for(var j=0; j < vObj.validators.length; j++){
					v = vObj.validators[j]; // Grab a validator
					// Make sure it's not disabled
					if(typeof(v.disabled) === 'undefined' || v.disabled === false){
						// execute the typeReq
						if(typeof(validators[v.type])==='function'){
							// Get the value being validated
							var val = vObj.value;
							// Get the pretty-print name. Use the object name if none set.
							var pretty = vObj.pretty || i;
							// Get the arguments if there are any
							var args = v.args || [];
							// Run the validator
							var ret = validators[v.type](val, pretty, args);

							if(!ret.valid){
								rObj.valid = false;
								// Make sure there's something to push to
								rObj.errorText[i] = rObj.errorText[i] || [];
								rObj.errorText[i].push(
									(typeof(v.failMsg)==='undefined') ?
										ret.errorText.charAt(0).toUpperCase() + ret.errorText.slice(1) :
										v.failMsg
								);
							}else{
								// Check if this validator has any others chained to it
								if(v.hasOwnProperty('chained')){
									// build a validationCollection
									var ch = {};
									ch[i] = {pretty: pretty, value: val,validators: v.chained};
									var chainedRet = this.check(ch);
									if(chainedRet.valid===false){
										rObj.valid = false;
										rObj.errorText[i] = rObj.errorText[i] || [];
										// Add any errors from the chain to the return object
										rObj.errorText[i] = rObj.errorText[i].concat(chainedRet.errorText[i]);
									}
								}
							}
						}else{
							console.warn('You tried to use a validator that doesn\'t exist!' +
								'The name you tried to use was: ' + v.type);
						}
					}
				}
			}}
			return rObj;
		}
	};
}]);


