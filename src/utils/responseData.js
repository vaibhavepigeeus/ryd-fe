export function getElementAnswers(element, responseData = {}) {
  if (responseData.answers?.[element.id]) {
    return responseData.answers[element.id];
  }

  const submittedElement = responseData.elements?.find((item) => item.id === element.id);
  if (submittedElement?.answers) {
    return submittedElement.answers;
  }

  return element.props?.answers || {};
}
