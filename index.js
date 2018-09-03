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
				img : 'images/01.jpg',
				name : 'Massage AMMA',
				price : 299.00,
				desc : 'massage 3adi..',
				stock : 1000,
			},
			{
				id : 2,
				name : 'chi haja',
				img : 'images/02.jpg',
				price : 199.00,
				desc : 'something here',
				stock : 1000,
				},
			{
				id : 3,
				name : 'chi haja akhra',
				img : 'images/03.jpg',
				price : 99.00,
				desc : 'something here',
				stock : 1000,				},
			{
				id : 4,
				name : 'something again',n
				img : 'images/04.jpg',
				price : 80.00,
				desc : 'something here',
				stock : 1000,				}
		],
		wrapper = $('.ProduitWrapper'),
		content = ''

		for(var i = 0; i < Produit.length; i++){


				content+= '<div class="coin-wrapper">'
				content+= '		<img src="'+Produit[i].img+'" alt="'+Produit[i].name+'">'
				content+= '		<span class="large-12 columns product-details">'
				content+= '			<h3>'+Produit[i].name+'</span></h3>'
				content+= '			<h3>Price: <span class="price">'+Produit[i].price+" MAD"+'</span></h3>'
				content+= '			<h3>Description: <span class="description">'+Produit[i].desc+'</span></h3>'
				content+= '		</span>'
				content+= '		<a class="large-12 columns btn submit ladda-button prod-'+Produit[i].id+'" data-style="slide-right" onclick="app.addtoCart('+Produit[i].id+');">Commander</a>'
				content+= '		<div class="clearfix"></div>'
				content+= '</div>'

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
			wrapper.html('<li>Panier</li>');
			$('.cart').css('left','-200%')
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
			items += '<li id="total">Total : $ '+total+' USD <div id="submitForm"></div></li>'
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
		//that will generate a dynamic form for paypal
		//with the Produits and their prices
		var cart = (JSON.parse(localStorage.getItem('cart')) != null) ? JSON.parse(localStorage.getItem('cart')) : {items : []} ;
		var statics = '<form action="mailto:belaminemmohamed@gmail.com" method="get"><input type="hidden" name="cmd" value="_cart"><input type="hidden" name="upload" value="1"><input type="hidden" name="currency_code" value="MAD" /><input type="hidden" name="business" value="'+business_paypal+'">',
		dinamic = '',
		wrapper = $('#submitForm')

		wrapper.html('')

		if(undefined != cart && null != cart && cart != ''){
			var i = 1;
			_.forEach(cart.items, function(prod, key) {
					dinamic += '<input type="hidden" name="item_name_'+i+'" value="'+prod.name+'">'
					dinamic += '<input type="hidden" name="amount_'+i+'" value="'+prod.price+'">'
					dinamic += '<input type="hidden" name="item_number_'+i+'" value="'+prod.id+'" />'
					dinamic += '<input type="hidden" name="quantity_'+i+'" value="'+prod.cant+'" />'
				i++;
			})

			statics += dinamic + '<button type="submit" class="pay">Payer &nbsp;<i class="ion-chevron-right"></i></button></form>'

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
