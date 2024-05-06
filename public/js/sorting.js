//  Function to run the sort and filter features on the adopt page

window.onload = function() {
    var ageSort = document.getElementById('ageSortCheckbox');
    var genderSort = document.getElementById('genderSortCheckbox');
    var maleFilter = document.getElementById('maleCheckbox');
    var femaleFilter = document.getElementById('femaleCheckbox');
    var anggoraCheckbox = document.getElementById('anggoraCheckbox');
    var himalayaCheckbox = document.getElementById('himalayaCheckbox');
    var kampungCheckbox = document.getElementById('kampungCheckbox');
    var mainecoonCheckbox = document.getElementById('mainecoonCheckbox');
    var munchkinCheckbox = document.getElementById('munchkinCheckbox');
    var persiaCheckbox = document.getElementById('persiaCheckbox');
    var ragdollCheckbox = document.getElementById('ragdollCheckbox');
    var siameseCheckbox = document.getElementById('siameseCheckbox');
    var childCheckbox = document.getElementById('childCheckbox');
    var adultCheckbox = document.getElementById('adultCheckbox');

    // Array of all breed checkboxes
    var breedCheckboxes = [anggoraCheckbox, himalayaCheckbox, kampungCheckbox, mainecoonCheckbox, munchkinCheckbox, persiaCheckbox, ragdollCheckbox, siameseCheckbox];
    var ageCheckboxes = [childCheckbox, adultCheckbox];

    // Add event listener to each breed checkbox
    breedCheckboxes.forEach(function(checkbox) {
        if (checkbox) {
            checkbox.addEventListener('change', function(event) {
                if (event.target.checked) {
                    window.location.href = '/adopt?breed=' + event.target.value;
                }
            });
        }
    });

    if (ageSort) {
        ageSort.addEventListener('change', function(event) {
            if (event.target.checked) {
                window.location.assign('/adopt?sort=age');
            }
        });
    }

    if (genderSort) {
        genderSort.addEventListener('change', function(event) {
            if (event.target.checked) {
                window.location.href = '/adopt?sort=gender';
            }
        });
    }

    if (maleFilter) {
        maleCheckbox.addEventListener('change', function(event) {
            if (event.target.checked) {
                window.location.href = '/adopt?gender=male';
            }
        });
    }

    if (femaleFilter) {
        femaleCheckbox.addEventListener('change', function(event) {
            if (event.target.checked) {
                window.location.href = '/adopt?gender=female';
            }
        });
    }

    ageCheckboxes.forEach(function(checkbox) {
    if (checkbox) {
        checkbox.addEventListener('change', function(event) {
            if (event.target.checked) {
                window.location.href = '/adopt?ageGroup=' + event.target.value;
            }
        });
    }
});


};