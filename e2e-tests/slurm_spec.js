'use strict';

var selectDropdownbyNum = function (optionNum) {
  if (optionNum){
    var options = element.all(by.options('qos for qos in qosOptions'))
      .then(function(options){
        options[optionNum].click();
      });
  }
};

var selectQos = function(index) {
  it('should have the name of selected qos', function() {
    selectDropdownbyNum(index);
    // refer to https://technpol.wordpress.com/2013/12/01/protractor-and-dropdowns-validation/
    var el = element(by.model('qosSelected')).$('option:checked');
    element(by.css('div.ace_content')).getText().then(function(text) {
      el.getText().then(function(selectedText){
        expect(text.split("=")[1]).toBe(selectedText);
      });
    });
  });
};


describe("SBATCH builder", function (){
  var mockModule;
  beforeEach(function() {
    browser.get('/#/slurm');
    mockModule = require('./mock.js');
    browser.addMockModule('httpMocker',mockModule.readModule);
  });

  // testing if the change in selected qos propagates to ace-editor (SBATCH Directives)
  selectQos(0);
  selectQos(1);

  it('should get a fake JSON object from a fake mocked back-end', function(){
    browser.get('/#/slurm');
    element.all(by.css('ul.nav-tabs > li')).then(function(items){
      // click "JOB STATUS" tab
      items[1].click();
      element.all(by.repeater('row in displayCollection')).then(function(tableItems){
        expect(tableItems.length).toBe(2);
      });
    });


  });

  it('should have the name of selected qos', function() {
    selectDropdownbyNum(3)
    // refer to https://technpol.wordpress.com/2013/12/01/protractor-and-dropdowns-validation/
    var el = element(by.model('qosSelected')).$('option:checked');
    element(by.css('div.ace_content')).getText().then(function(text) {
      el.getText().then(function(selectedText){
        expect(text.split("=")[1]).toBe(selectedText);
      });

    });
  });

  it('should have a value on the ace-editor',function (){
    var el = element(by.model("model['nodes']"));

    // type "1" in a form field "nodes".
    var numberOfNodes = '1';
    el.sendKeys(numberOfNodes);
    element(by.css('div.ace_content')).getText().then(function(text) {
      var nodes = text.split("\n")[1];
      expect(nodes.split("=")[1]).toBe(numberOfNodes);
    });
    // cheking the submit button
    expect(element(by.id('submit-button')).isEnabled()).toBe(true);
  });

  it('should NOT have a value on the ace-editor since the value is invalid',function (){
    var el = element(by.model("model['nodes']"));
    browser.sleep(1500);
    // type "-1" in a form field "nodes".
    var numberOfNodes = '-1';
    el.sendKeys(numberOfNodes);
    element(by.css('div.ace_content')).getText().then(function(text) {
      var shouldBeUndefined = text.split("\n")[1];
      expect(shouldBeUndefined).toBe(undefined);
    });
    // cheking the submit button (in this case it should be disabled since node's value is invalid)
    expect(element(by.id('submit-button')).isEnabled()).toBe(false);
  });

  it('should add a new form field and delete it', function(){
    var input = element(by.model('selected'));

    // after entering "array", one needs two ENTERs pressed.
    input.sendKeys('array', protractor.Key.ENTER, protractor.Key.ENTER);
    var el_array = element(by.model("model['array']"));
    expect(el_array.isPresent()).toBe(true);

    // get the parent element
    var parent = el_array.element(by.xpath('..'));
    // get a delete button from the parent
    var delete_button = parent.$$('.btn').get(1);
    delete_button.click();


    // get the array field again (this time it should not exist).
    var el_array = element(by.model("model['array']"));
    expect(el_array.isPresent()).toBe(false);

  });

  it('should be able to save a script', function(){

    var el_nodes = element(by.model("model['nodes']"));
    // write 12 to node field
    el_nodes.sendKeys('12');

    var SBATCH_SCRIPT = element(by.id('ace-script'));
    var text_input = SBATCH_SCRIPT.$('textarea.ace_text-input');

    // write TEST to a textarea of SBATCH SCRIPT
    browser.actions().doubleClick(SBATCH_SCRIPT).perform();
    text_input.sendKeys('TEST');


    var saveButton = element(by.id('save-button'));
    saveButton.click();

    // expand the file tree
    var fileNode = element.all(by.css('.tree-branch-head')).first();
    fileNode.click();

    // select the folder at the top
    var folder = element.all(by.css('.tree-label')).first();
    folder.click();

    // name the new scipt as 'test.sh'
    var fileName = element(by.model("newFile.filename"));
    fileName.sendKeys("test.sh");

    // click the 'save' button
    var saveFile = element(by.buttonText('Save File As'));
    saveFile.click();
    browser.sleep(2000);
  });

  it('should be able to load a saved script', function(){

    var loadButton = element(by.id('load-button'));
    loadButton.click();

    // expand the file tree
    var fileNode = element.all(by.css('.tree-branch-head')).first();
    fileNode.click();

    // select the folder at the top
    var folder = element.all(by.css('.tree-label')).first();
    folder.click();

    // for each element (either a folder or file ) in the top directory
    element.all(by.css('ul.ng-scope > li ul.ng-scope > li'))
      .each(function (e){
        // get the name of the element
        e.$('.tree-label span').getText().then(function(name){
          if (name === "test.sh")
          {
            e.$('.tree-label').click();
          }
        });
      });

    // click the 'save' button
    var loadFile = element(by.buttonText('Load File'));
    loadFile.click();
    browser.sleep(2000);
    var scriptText = element(by.id('ace-script')).$('.ace_content');
    var directivesText = element(by.id('ace-directives')).$('.ace_content');

    scriptText.getText().then(function(text){
      /*
        Text should look like:
        #!/bin/bash
        TEST
      */
      expect(text.split("\n")[0]).toBe('#!/bin/bash');
      expect(text.split("\n")[1]).toBe('TEST');
    });

    directivesText.getText().then(function(text){
      /*
      Text should look like:
      #SBATCH --qos=janus-long
      #SBATCH --nodes=12
      */
      expect(text.split("\n")[0]).toBe('#SBATCH --qos=janus-long');
      expect(text.split("\n")[1]).toBe('#SBATCH --nodes=12');
    });

  });



});
