# -*- coding: utf-8 -*-
import re
import pdb
from itertools import count

APOSTROPHE_CHARS = [u"'", u"’"]


def isPunct(s):
  """
  Returns whether s is a punctuation or not.
  """
  return all([not c.isalnum() for c in s])


def tokenize(t):
  """
  Input: t Unicode string
  Output: a list of associative array

  [{
          \"start_index\": <int>,
          \"end_index\": <int>,
          \"text\": <string> ,
          \"is_punctuation\": <bool>
  }]

  Parameters:
  start_index: the start index of the token in t
  end_index: the last index of the token in t
  text: the text of the token
  is_punctuation: a boolean as to whether this is a token that requires annotation (non-punctuation) or not
  """

  t = t.strip()
  # defining linefeed and whitespace regexps
  linefeed = re.compile('[^\n]+')
  whitespace = re.compile('\S+')

  # takes a list of 4-tuples and turns them into an associative array,
  # in the format specified above.
  tuples_to_dict = lambda L: [dict(zip(['start_index', 'end_index', 'text', 'is_punctuation'], x)) \
                              for x in L]

  # the output list
  output = []

  # spliting the text into paragraphs according to linefeed
  paragraphs = [(m.group(0), m.start()) for m in linefeed.finditer(t)]

  # for every parapgraph p and parag_offset (in string t, in chars)
  for p, parag_offset in paragraphs:

    # the first token of each paragraph is a linefeed token
    if parag_offset > 0:
      output.extend(tuples_to_dict([(parag_offset - 1, parag_offset - 1, '\n', True)]))


    # split each paragraph into words by whitespace
    words = [(m.group(0), parag_offset + m.start()) for m in whitespace.finditer(p)]

    # for every word and word_offset (in string t, in chars)
    for word, word_offset in words:

      # extract all indices of non-alphanumeric chars in word
      non_alphanum = [ind for ind, c in enumerate(word) if not c.isalnum()]

      # determine which of the non-alphanumeric chars in word are apostrophes
      # (they require special treatment)
      apostrophes = [ind for ind in non_alphanum if word[ind] in APOSTROPHE_CHARS]

      # determine delimiters for splitting word: delimiters are all non-alphanumeric
      # chars except:
      # 1. If there are multiple consecutive non-alphanumeric chars, take only the first and the
      # last chars as delimiters.
      # 2. If the last char in the sequence is an apostrophe, take
      # only the first in the sequence as a delimiter.
      delims1 = [x for x in non_alphanum if x - 1 not in non_alphanum]
      delims2 = [x + 1 for x in non_alphanum if x + 1 not in non_alphanum and x not in apostrophes]
      delims = sorted(delims1 + delims2)

      # split word by the delimiters
      token_candidates = [(word_offset + d1, word_offset + d2 - 1, word[d1:d2], isPunct(word[d1:d2])) \
                          for d1, d2 in zip([0] + delims, delims + [len(word)]) if d1 < d2]

      # fix n't tokens (as in won't, don't etc.), which require special treatment
      for token_ind, t1, t2 in zip(count(), token_candidates, token_candidates[1:]):
        if t2[2] == "'t" and t1[2][-1] == 'n' and len(t1[2]) > 1:
          token_candidates[token_ind] = (t1[0], t1[1] - 1, t1[2][:-1], isPunct(t1[2][:-1]))
          token_candidates[token_ind + 1] = (t2[0] - 1, t2[1], 'n' + t2[2], isPunct('n' + t2[2]))

      # extend the list with new tokens
      output.extend(tuples_to_dict(token_candidates))

  output.sort(key=lambda x :-x["start_index"])
  # return the list without the first linefeed token, which is superfluous
  return output




