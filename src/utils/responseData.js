export function responseDataToAnswers(responseData = {}) {
  if (responseData.answers && typeof responseData.answers === 'object') {
    return responseData.answers;
  }

  if (Array.isArray(responseData.elements)) {
    return responseData.elements.reduce((acc, element) => {
      if (element?.id) {
        acc[element.id] = element.answers || {};
      }
      return acc;
    }, {});
  }

  return {};
}

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
