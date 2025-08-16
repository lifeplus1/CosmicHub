from backend.utils.pseudonymization import pseudonymize, generate_salt

def test_deterministic_with_same_salt():
    salt = generate_salt()
    a = pseudonymize("user123", salt)
    b = pseudonymize("user123", salt)
    assert a == b

def test_different_with_different_salt():
    salt1 = generate_salt()
    salt2 = generate_salt()
    a = pseudonymize("user123", salt1)
    b = pseudonymize("user123", salt2)
    assert a != b

def test_handles_non_string():
    salt = generate_salt()
    assert pseudonymize(123, salt)
