var app = window.app || {},
business_paypal = ''; // here goes your paypal email

(function($){
	'use strict';

	//no coflict with underscores

	app.init = function(){
		//totalItems totalAmount
		var total = 0,
		items = 0

		var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ;

		if(undefined != cart.items && cart.items != null && cart.items != '' && cart.items.length > 0){
			_.forEach(cart.items, function(n, key) {
			   items = (items + n.cant)
			   total = total  + (n.cant * n.price)
			});

		}

		$('#totalItems').text(items)
		$('.totalAmount').text('$ '+total+ ' MAD')

	}

	app.createProducts = function(){
		var Produit = [
			{
				id : 1,
				img : 'Photos/Méditation.png',
				name : 'Méditation',
				price : 150.00,
				desc :"Désigne une pratique mentale ou spirituelle. Elle consiste souvent en une attention portée sur un certain objet de pensée ou sur soi. La méditation implique généralement que le pratiquant amène son attention de façon centripète sur un seul point de référence",
        stock : 1000 ,

			},
      {
        id : 2,
        img : 'Photos/Hypnose.png',
        name : 'Hypnose',
        price : 199.00,
        desc : "L'hypnose thérapeutique est une discipline qui permet d'accéder au réservoir de ressources inconscientes de chaque individu en levant les résistances au changement et laisser la personne accéder à ses propres ressources. ",
        stock : 1000 ,

      },

      {
        id : 3,
        img : "Photos/Atelier parfum d'ambiance.png",
        name : 'Atelier parfum d’ambiance',
        price : 149.00,
        desc : "Des séances individuelles et personnalisées proposées en entreprise ou le temps d’un événement pour apporter bien être et ressourcement.<br> Nous travaillons uniquement avec des huiles essentielles et des arômes triés sur le volet et réévalués régulièrement, pour leurs qualités olfactives et vibratoires. La notion de terroir, de cru, de millésime a toute sa place dans notre univers !",
        stock : 1000 ,

      },
		],
		wrapper = $('.ProduitWrapper'),
		content = ''

		for(var i = 0; i < Produit.length; i++){
				content+= '<div class="card col-lg-4">'
        content+= '<div class="card-wrapper"><div class="card-img">'
				content+= '<img src="'+Produit[i].img+'"></div><div class="card-box"><h4 class="card-title mbr-fonts-style display-7">'+Produit[i].name+'</h4>'
				content+= '<p class="mbr-text mbr-fonts-style display-7">'+Produit[i].desc+'<br><br>Prix : '+Produit[i].price+' MAD <br></div>'
				content+= '<div class="mbr-section-btn text-center"><a class="btn btn-primary display-4 prod-'+Produit[i].id+'" data-style="slide-right" onclick="app.addtoCart('+Produit[i].id+');">Commander</a></div></div></div>'


}


		wrapper.html(content)

		localStorage.setItem('Produit',JSON.stringify(Produit))
	}

	app.addtoCart = function(id){
		var l = Ladda.create( document.querySelector( '.prod-'+id ) );

		l.start();
		var Produit = JSON.parse(localStorage.getItem('Produit')),
		producto = _.find(Produit,{ 'id' : id }),
		cant = 1
		if(cant <= producto.stock){
			if(undefined != producto){
				if(cant == 1){
					setTimeout(function(){
						var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ;
						app.searchProd(cart,producto.id,parseInt(cant),producto.name,producto.price,producto.img,producto.stock)
						l.stop();
					},2000)
				}else{
					alert('Only quantities greater than zero are allowed')
				}
			}else{
				alert('Oops! Something bad happened, try again later')
			}
		}else{
			alert('Can not add more than this product')
		}
	}

	app.searchProd = function(cart,id,cant,name,price,img,available){
		//if we pass a negative value to the amount, it is deducted from the cart
		var curProd = _.find(cart.items, { 'id': id })

		if(undefined != curProd && curProd != null){
			//the product already exists, we add one more to its quantity
			if(curProd.cant < available){
				curProd.cant = parseInt(curProd.cant + cant)
			}else{
				alert('Can not add more than this product')
			}

		}else{
			//if not, we add it to the cart
			var prod = {
				id : id,
				cant : cant,
				name : name,
				price : price,
				img : img,
				available : available
			}
			cart.items.push(prod)

		}
		localStorage.setItem('cart',JSON.stringify(cart))
		app.init()
		app.getProducts()
		app.updatePayForm()
	}

	app.getProducts = function(){
		var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []},
		msg = '',
		wrapper = $('.cart'),
		total = 0
		wrapper.html('')

		if(undefined == cart || null == cart || cart == '' || cart.items.length == 0){
			wrapper.html('<li>Votre panier est vide</li>');
			$('.cart').css('left','-500%')
		}else{
			var items = '';
			_.forEach(cart.items, function(n, key) {

			   total = total  + (n.cant * n.price)
			   items += '<li>'
			   items += '<img src="'+n.img+'" />'
			   items += '<h3 class="title">'+n.name+'<br><span class="price">'+n.cant+' x '+n.price+' MAD</span> <button class="add" onclick="app.updateItem('+n.id+','+n.available+')"><i class="icon ion-minus-circled"></i></button> <button onclick="app.deleteProd('+n.id+')" ><i class="icon ion-close-circled"></i></button><div class="clearfix"></div></h3>'
			   items += '</li>'
			});

			//agregar el total al carrito
			items += '<li id="total">Total : '+total+' MAD <div id="submitForm"></div></li>'
			wrapper.html(items)
			$('.cart').css('left','-500%')
		}
	}

	app.updateItem = function(id,available){
		//resta uno a la cantidad del carrito de compras
		var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ,
		curProd = _.find(cart.items, { 'id': id })
			//actualizar el carrito
			curProd.cant = curProd.cant - 1;
			//validar que la cantidad no sea menor a 0
			if(curProd.cant > 0){
				localStorage.setItem('cart',JSON.stringify(cart))
				app.init()
				app.getProducts()
				app.updatePayForm()
			}else{
				app.deleteProd(id,true)
			}
	}

	app.delete = function(id){
		var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ;
		var curProd = _.find(cart.items, { 'id': id })
		_.remove(cart.items, curProd);
		localStorage.setItem('cart',JSON.stringify(cart))
		app.init()
		app.getProducts()
		app.updatePayForm()
	}

	app.deleteProd = function(id,remove){
		if(undefined != id && id > 0){

			if(remove == true){
				app.delete(id)
			}else{
				var conf = confirm('Do you want to delete this product?')
				if(conf){
					app.delete(id)
				}
			}

		}
	}

	app.updatePayForm = function(){


				var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ;
        var email = 'belamine.mohamed@phone-group.ma';
        var subject = 'Commandes';
        var body = localStorage.getItem("cart") ;
        var url = 'mailto:' + email + '?subject=' + subject + '&body=' + encodeURIComponent(body);

		var statics = '<a href="' + url + '',
		dinamic = '',
		wrapper = $('#submitForm')

		wrapper.html('')

		if(undefined != cart && null != cart && cart != ''){
			var i = 0;
			_.forEach(cart.items, function(prod, key) {
					dinamic += '<input type="" name="item_name_'+i+'" value="'+prod.name+'"/>'
					dinamic += '<input type="hidden" name="amount_'+i+'" value="'+prod.price+'"/>'
					dinamic += '<input type="hidden" name="item_number_'+i+'" value="'+prod.id+'" />'
					dinamic += '<input type="hidden" name="quantity_'+i+'" value="'+prod.cant+'" />'
				i++;
			})
			statics += '"submit" class="pay">Finaliser&nbsp;<i class="ion-chevron-right"></i></button>',
			wrapper.html(statics)
		}
	}








	$(document).ready(function(){
		app.init()
		app.getProducts()
		app.updatePayForm()
		app.createProducts()
	})

})(jQuery)
