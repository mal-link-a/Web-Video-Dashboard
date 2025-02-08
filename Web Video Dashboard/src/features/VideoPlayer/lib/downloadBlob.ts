//Сохранение изображения из blob на локальное устройство пользователя
export const downloadBlob = (blob: Blob) => {
  //Создаем название файла
  const date = new Date();
  const dateString = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  //Создаём линк на загрузку изобржажения, выполняем его и удаляем
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = dateString;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
