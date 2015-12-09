


function get_code( ch )
{
    ch = ch.toLowerCase();

    var number = 48;
    var letter = 65;

    switch( ch )
    {
        case '9':
            number += 1;
        case '8':
            number += 1;
        case '7':
            number += 1;
        case '6':
            number += 1;
        case '5':
            number += 1;
        case '4':
            number += 1;
        case '3':
            number += 1;
        case '2':
            number += 1;
        case '1':
            number += 1;
        case '0':
            return number;;
        case 'z':
            letter += 1;
        case 'y':
            letter += 1;
        case 'x':
            letter += 1;
        case 'w':
            letter += 1;
        case 'v':
            letter += 1;
        case 'u':
            letter += 1;
        case 't':
            letter += 1;
        case 's':
            letter += 1;
        case 'r':
            letter += 1;
        case 'q':
            letter += 1;
        case 'p':
            letter += 1;
        case 'o':
            letter += 1;
        case 'n':
            letter += 1;
        case 'm':
            letter += 1;
        case 'l':
            letter += 1;
        case 'k':
            letter += 1;
        case 'j':
            letter += 1;
        case 'i':
            letter += 1;
        case 'h':
            letter += 1;
        case 'g':
            letter += 1;
        case 'f':
            letter += 1;
        case 'e':
            letter += 1;
        case 'd':
            letter += 1;
        case 'c':
            letter += 1;
        case 'b':
            letter += 1;
        case 'a':
            return letter;
            //whitespace
        case 'tab':
            return 9;
        case 'space':
        case ' ':
            return 32;
            //control
        case 'up_arrow':
            return 38;
        case 'down_arrow':
            return 40;
        case 'right_arrow':
            return 39;
        case 'left_arrow':
            return 37;
        case 'ctrl':
            return 17;
        case 'alt':
            return 18;
        case 'shift':
            return 16;
        case 'home':
            return 36;
        case 'end':
            return 35;
        case 'insert':
            return 45;
        case 'delete':
            return 46;
        case 'page_up':
            return 33;
        case 'page_down':
            return 34;
        case 'backspace':
            return 8;
        case 'enter':
            return 13;
        case 'break':
            return 19;
        case 'esc':            
            return 27;
            //numpad
        case 'num_0':
            return 96;
        case 'num_1':
            return 97;
        case 'num_2':
            return 98;
        case 'num_3':
            return 99;
        case 'num_4':
            return 100;
        case 'num_5':
            return 101;
        case 'num_6':
            return 102;
        case 'num_7':
            return 103;
        case 'num_8':
            return 104;
        case 'num_9':
            return 105;
        case 'num_lock':
            return 144;
        case 'num_/':
            return 111;
        case 'num_*':
            return 106;
        case 'num_-':
            return 109;
        case 'num_+':
            return 107;
        case 'num_enter':
            return 13;
        case 'num_.':
            return 46;
            //punctuation
        case "'":
            return 222;
        case '/':
            return 191;
        case '\\':
            return 220;
        case ']':
            return 221;
        case '[':
            return 219;
        case ';':
            return 186;
        case '.':
            return 190;
        case ',':
            return 188;
        case '=':
            return 187;
        case '-':
            return 189;
        case '`':
            return 192;
            //F-keys
        case 'f1':
            return 112;
        case 'f2':
            return 113;
        case 'f3':
            return 114;
        case 'f4':
            return 115;
        case 'f5':
            return 116;
        case 'f6':
            return 117;
        case 'f7':
            return 118;
        case 'f8':
            return 119;
        case 'f9':
            return 120;
        case 'f10':
            return 121;
        case 'f11':
            return 122;
        case 'f12':
            return 123;
            
    }
    

    /*
    if( ch = 'tab' )
        return 9;

    if( ch = 'capslock' )
        return 20;


    if( ch.length == 1 )
    {
        return
    }
    */
}
