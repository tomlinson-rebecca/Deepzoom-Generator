
$(document).ready(function(){
	$('#uploadCollection').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			$('.modal-loading').modal({ show : false, keyboard : false, backdrop : 'static' });
			$('.modal-loading .modal-body h3').html('Loading....');
			$('.modal-loading').modal('show');
			return true;
		},
		success	: function(data, status, xhr, $form){
			setTimeout(function(){
				window.location = window.location.href + data;
				setTimeout(function(){
					window.location.href = '/';
				}, 1000);
			}, 3000);
		},
		error : function(e){
			$('.modal-loading .modal-body h3').html('FAILED!!!');
			setTimeout(function(){window.location.href = '/';}, 3000);
		}
	});

});
