export const capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const shortenMonth = function(date) {
  switch(date.getMonth() + 1) {
    case 1:
      return "Ene";
      break;
    case 2:
      return "Feb";
      break;
    case 3:
      return "Mar";
      break;
    case 4:
      return "Abr";
      break;
    case 5:
      return "May";
      break;
    case 6:
      return "Jun";
      break;
    case 7:
      return "Jul";
      break;
    case 8:
      return "Ago";
      break;
    case 9:
      return "Sep";
      break;
    case 10:
      return "Oct";
      break;
    case 11:
      return "Nov";
      break;
    case 12:
      return "Dic";
      break;
  }
  return "Error";
}

export const getMonthName = function(date) {
  switch(date.getMonth() + 1) {
    case 1:
      return "Enero";
      break;
    case 2:
      return "Febrero";
      break;
    case 3:
      return "Marzo";
      break;
    case 4:
      return "Abril";
      break;
    case 5:
      return "Mayo";
      break;
    case 6:
      return "Junio";
      break;
    case 7:
      return "Julio";
      break;
    case 8:
      return "Agosto";
      break;
    case 9:
      return "Septiembre";
      break;
    case 10:
      return "Octubre";
      break;
    case 11:
      return "Noviembre";
      break;
    case 12:
      return "Diciembre";
      break;
  }
  return "Error";
}

export const styleDate = function(date) {
  return date.getDate() + ' ' + getMonthName(date) + ' del ' + date.getFullYear();
}

export const styleShortDate = function(date) {
  if(typeof date === "number")  date = new Date(date);
  return date.getDate() + " " + shortenMonth(date);
}

export const formatPrice = function(price) {
  if (price == 0) {
    return 'Gratis'
  } else {
    var m = Math.trunc(price / 1000);
    var u = (price - (m * 1000)).toString();
    if(u.length == 2) {
      u = '0' + price;
    }
    if(u.length == 1) {
      u = '00' + u;
    }
    return '$' + m + '.' + u;
  }
}

export const formatTime = function(date) {
  return moment(date).format("hh:mma");
}

export const validateEmail = function(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
