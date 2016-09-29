describe('sandstone.slurm.sa-sbatchscript', function() {
  var baseElement = '<div sa-sbatch-script sbatch="sbatch" script="script" sbatch-script="sbatchScript">';

  beforeEach(module('sandstone'));
  beforeEach(module('sandstone.templates'));
  beforeEach(module('sandstone.slurm'));

  describe('controller', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.sbatch = {};
      $scope.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
      $scope.sbatchScript = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('$watch: $scope.sbatch', function() {
      spyOn(isolateScope,'compileScript');
      isolateScope.sbatch = {'test':'test'};
      $scope.$digest();
      expect(isolateScope.compileScript.calls.argsFor(0)).toEqual([{'test': 'test'}]);
    });

    it('compileScript', function() {

    });
  });

  describe('directive', function() {
    var $compile, $scope, isolateScope, element;

    beforeEach(inject(function(_$compile_,_$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_.$new();
      $scope.sbatch = {};
      $scope.script = '# Add your script below\n# ex: "srun echo $(hostname)"\n';
      $scope.sbatchScript = '';
      element = $compile(baseElement)($scope);
      $scope.$digest();
      isolateScope = element.isolateScope();
    }));

    it('separates directive and script components', function() {

    });

    it('updates $scope.sbatchScript when Ace value changes', function() {

    });
  });
});
